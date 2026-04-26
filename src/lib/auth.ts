import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  deleteField,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { AppUser, Role, Lang, GrandparentTitle } from '../types';

// Firebase Auth uses a fixed session password (never the PIN).
// The PIN lives in /userPins (auth-gated) so /users can stay publicly readable
// for the username-based login lookup without leaking PINs.
const FIXED_SUFFIX = 'FMLY2024FIX';
const OLD_SUFFIX   = 'FMLY2024';     // used by accounts created before this fix

function toEmail(username: string) {
  return `${username.toLowerCase().replace(/\s+/g, '_')}@family.local`;
}

function toFixedPassword(username: string) {
  return `${username.toLowerCase()}${FIXED_SUFFIX}`;
}

function toOldPassword(pin: string) {
  return `${pin}${OLD_SUFFIX}`;
}

export async function loginWithPin(username: string, pin: string): Promise<AppUser> {
  // Query Firestore by username to get the stored email (users collection is publicly readable)
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase().trim()));
  const qsnap = await getDocs(q);
  if (qsnap.empty) throw new Error('User not found');
  const userDoc = qsnap.docs[0];
  const userId = userDoc.id;
  const data = userDoc.data();

  // Derive Firebase Auth password from the stored (original) email prefix
  const emailPrefix = data.email.replace('@family.local', '');

  // Try the new fixed-password scheme first
  try {
    await signInWithEmailAndPassword(auth, data.email, toFixedPassword(emailPrefix));
  } catch {
    // Fall back to old PIN-based scheme (accounts created before the fix)
    await signInWithEmailAndPassword(auth, data.email, toOldPassword(pin));
    try { await updatePassword(auth.currentUser!, toFixedPassword(emailPrefix)); } catch { /* ignore */ }
  }

  // Verify PIN from /userPins (auth-gated so it's not publicly readable)
  const pinSnap = await getDoc(doc(db, 'userPins', userId));
  let storedPin: string | undefined = pinSnap.exists() ? pinSnap.data().pin : undefined;

  // One-time migration: older accounts kept the PIN inside the /users doc.
  // Move it to /userPins and strip it from /users so public reads don't leak it.
  if (!storedPin && data.pin) {
    storedPin = data.pin as string;
    try {
      await setDoc(doc(db, 'userPins', userId), { pin: storedPin });
      await updateDoc(doc(db, 'users', userId), { pin: deleteField() });
    } catch { /* ignore — next login will retry */ }
  }

  if (storedPin) {
    if (storedPin !== pin) {
      await signOut(auth);
      throw new Error('Invalid PIN');
    }
  } else {
    // First login on this account — store PIN for future verification
    await setDoc(doc(db, 'userPins', userId), { pin });
  }

  const cleanData = { ...data } as Record<string, unknown>;
  delete cleanData.pin;
  return { id: userId, ...cleanData } as AppUser;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function createFamilyUser(params: {
  username: string;
  displayName: string;
  pin: string;
  role: Role;
  color: string;
  avatar: string;
  language: Lang;
  grandparentTitle?: GrandparentTitle;
  notificationEmail?: string;
  allowedGrandparentIds?: string[];
  grandparentTitleOverrides?: Record<string, GrandparentTitle>;
  createdBy: string;
}): Promise<AppUser> {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const email = toEmail(params.username);
  const cred = await createUserWithEmailAndPassword(auth, email, toFixedPassword(params.username));
  const userData: Omit<AppUser, 'id'> = {
    username:    params.username,
    displayName: params.displayName,
    role:        params.role,
    color:       params.color,
    avatar:      params.avatar,
    email,
    language:    params.language,
    createdAt:   serverTimestamp() as AppUser['createdAt'],
    createdBy:   params.createdBy,
    ...(params.grandparentTitle  && { grandparentTitle:  params.grandparentTitle }),
    ...(params.notificationEmail && { notificationEmail: params.notificationEmail }),
    ...(params.allowedGrandparentIds && params.allowedGrandparentIds.length > 0 && { allowedGrandparentIds: params.allowedGrandparentIds }),
    ...(params.grandparentTitleOverrides && Object.keys(params.grandparentTitleOverrides).length > 0 && { grandparentTitleOverrides: params.grandparentTitleOverrides }),
  };
  await setDoc(doc(db, 'users', cred.user.uid), userData);
  // PIN lives separately so public reads on /users don't leak it.
  await setDoc(doc(db, 'userPins', cred.user.uid), { pin: params.pin });
  return { id: cred.user.uid, ...userData };
}

// Parent can update any user's PIN — only touches /userPins, no Firebase Auth change needed
export async function updateUserPin(userId: string, newPin: string) {
  await setDoc(doc(db, 'userPins', userId), { pin: newPin });
}

// Parent can rename a user's login username — only touches Firestore; Firebase Auth email is unchanged
export async function updateUsername(userId: string, newUsername: string) {
  await updateDoc(doc(db, 'users', userId), { username: newUsername.toLowerCase().trim() });
}

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
}

export async function getUsersByRole(role: Role): Promise<AppUser[]> {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as AppUser;
}

export async function updateUserProfile(userId: string, updates: Partial<AppUser>) {
  await updateDoc(doc(db, 'users', userId), updates as Record<string, unknown>);
}

export async function deleteUserAccount(userId: string) {
  const { deleteUser } = await import('firebase/auth');
  await updateDoc(doc(db, 'users', userId), { deleted: true });
  if (auth.currentUser?.uid === userId) {
    await deleteUser(auth.currentUser);
  }
}
