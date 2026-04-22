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
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { AppUser, Role, Lang } from '../types';

const SUFFIX = 'FMLY2024';

function toEmail(username: string) {
  return `${username.toLowerCase().replace(/\s+/g, '_')}@family.local`;
}

function toPassword(pin: string) {
  return `${pin}${SUFFIX}`;
}

export async function loginWithPin(username: string, pin: string): Promise<AppUser> {
  const email = toEmail(username);
  const password = toPassword(pin);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (!snap.exists()) throw new Error('User profile not found');
  return { id: snap.id, ...snap.data() } as AppUser;
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
  grandparentTitle?: '公公' | '婆婆';
  notificationEmail?: string;
  createdBy: string;
}): Promise<AppUser> {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const email = toEmail(params.username);
  const password = toPassword(params.pin);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const userData: Omit<AppUser, 'id'> = {
    username:          params.username,
    displayName:       params.displayName,
    role:              params.role,
    color:             params.color,
    avatar:            params.avatar,
    email,
    language:          params.language,
    grandparentTitle:  params.grandparentTitle,
    notificationEmail: params.notificationEmail,
    createdAt:         serverTimestamp() as AppUser['createdAt'],
    createdBy:         params.createdBy,
  };
  await setDoc(doc(db, 'users', cred.user.uid), userData);
  return { id: cred.user.uid, ...userData };
}

export async function updateUserPin(userId: string, newPin: string) {
  if (!auth.currentUser) throw new Error('Not authenticated');
  await updatePassword(auth.currentUser, toPassword(newPin));
  await updateDoc(doc(db, 'users', userId), { pin: newPin });
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
