import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Conversation,
  Message,
  Prompt,
  PromptClaim,
  PromptCategory,
  NewConversationPayload,
  AppUser,
  PromptStatus,
} from '../types';

// ── Conversations ────────────────────────────────────────────────────

export async function createConversation(
  grandchild: AppUser,
  grandparent: AppUser,
  payload: NewConversationPayload,
  firstMessage: string,
  messageType: 'text' | 'photo' | 'voice' = 'text',
  mediaUrl?: string,
): Promise<string> {
  const batch = writeBatch(db);

  const convRef = doc(collection(db, 'conversations'));
  const convData: Omit<Conversation, 'id'> = {
    grandchildId:      grandchild.id,
    grandchildName:    grandchild.displayName,
    grandchildColor:   grandchild.color,
    grandchildAvatar:  grandchild.avatar,
    grandparentId:     grandparent.id,
    grandparentName:   grandparent.displayName,
    grandparentTitle:  grandparent.grandparentTitle!,
    promptId:          payload.promptId,
    title:             payload.title,
    status:            'open',
    lastMessageAt:     serverTimestamp() as Conversation['lastMessageAt'],
    lastMessageText:   firstMessage,
    lastMessageBy:     grandchild.displayName,
    unreadGrandchild:  false,
    unreadGrandparent: true,
    createdAt:         serverTimestamp() as Conversation['createdAt'],
  };
  batch.set(convRef, convData);

  const msgRef = doc(collection(db, 'messages'));
  batch.set(msgRef, {
    conversationId: convRef.id,
    senderId:       grandchild.id,
    senderName:     grandchild.displayName,
    senderRole:     'grandchild',
    type:           messageType,
    text:           firstMessage,
    mediaUrl:       mediaUrl ?? null,
    createdAt:      serverTimestamp(),
  });

  if (payload.promptId) {
    const claimRef = doc(db, 'promptClaims', `${grandparent.id}_${payload.promptId}`);
    batch.set(claimRef, {
      promptId:       payload.promptId,
      grandparentId:  grandparent.id,
      grandchildId:   grandchild.id,
      grandchildName: grandchild.displayName,
      conversationId: convRef.id,
      claimedAt:      serverTimestamp(),
    });
  }

  await batch.commit();
  return convRef.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'grandchild' | 'grandparent',
  text: string,
  type: 'text' | 'photo' | 'voice' = 'text',
  mediaUrl?: string,
) {
  const batch = writeBatch(db);

  const msgRef = doc(collection(db, 'messages'));
  batch.set(msgRef, {
    conversationId,
    senderId,
    senderName,
    senderRole,
    type,
    text,
    mediaUrl: mediaUrl ?? null,
    createdAt: serverTimestamp(),
  });

  const convRef = doc(db, 'conversations', conversationId);
  batch.update(convRef, {
    lastMessageAt:     serverTimestamp(),
    lastMessageText:   text,
    lastMessageBy:     senderName,
    unreadGrandchild:  senderRole === 'grandparent',
    unreadGrandparent: senderRole === 'grandchild',
  });

  await batch.commit();
}

export async function closeConversation(conversationId: string) {
  await updateDoc(doc(db, 'conversations', conversationId), { status: 'closed' });
}

export async function markConversationRead(conversationId: string, role: 'grandchild' | 'grandparent') {
  const field = role === 'grandchild' ? 'unreadGrandchild' : 'unreadGrandparent';
  await updateDoc(doc(db, 'conversations', conversationId), { [field]: false });
}

export function subscribeConversation(id: string, cb: (c: Conversation) => void) {
  return onSnapshot(doc(db, 'conversations', id), snap => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() } as Conversation);
  });
}

export function subscribeMessages(conversationId: string, cb: (msgs: Message[]) => void) {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
  );
  return onSnapshot(q, snap => {
    const msgs = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Message))
      .sort((a, b) => {
        const aMs = a.createdAt?.toDate?.()?.getTime() ?? 0;
        const bMs = b.createdAt?.toDate?.()?.getTime() ?? 0;
        return aMs - bMs;
      });
    cb(msgs);
  });
}

export function subscribeChildConversations(grandchildId: string, cb: (convs: Conversation[]) => void) {
  const q = query(collection(db, 'conversations'), where('grandchildId', '==', grandchildId));
  return onSnapshot(q, snap => {
    const convs = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Conversation))
      .sort((a, b) => (b.lastMessageAt?.toDate?.()?.getTime() ?? 0) - (a.lastMessageAt?.toDate?.()?.getTime() ?? 0));
    cb(convs);
  });
}

export function subscribeGrandparentConversations(grandparentId: string, cb: (convs: Conversation[]) => void) {
  const q = query(collection(db, 'conversations'), where('grandparentId', '==', grandparentId));
  return onSnapshot(q, snap => {
    const convs = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Conversation))
      .sort((a, b) => (b.lastMessageAt?.toDate?.()?.getTime() ?? 0) - (a.lastMessageAt?.toDate?.()?.getTime() ?? 0));
    cb(convs);
  });
}

export function subscribeAllConversations(cb: (convs: Conversation[]) => void) {
  const q = query(collection(db, 'conversations'));
  return onSnapshot(q, snap => {
    const convs = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Conversation))
      .sort((a, b) => (b.lastMessageAt?.toDate?.()?.getTime() ?? 0) - (a.lastMessageAt?.toDate?.()?.getTime() ?? 0));
    cb(convs);
  });
}

export async function getOpenConversation(grandchildId: string, grandparentId: string): Promise<Conversation | null> {
  const q = query(
    collection(db, 'conversations'),
    where('grandchildId', '==', grandchildId),
    where('grandparentId', '==', grandparentId),
    where('status', '==', 'open'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Conversation;
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const snap = await getDoc(doc(db, 'conversations', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Conversation;
}

export async function getAllConversationsOnce(): Promise<Conversation[]> {
  const snap = await getDocs(collection(db, 'conversations'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Conversation))
    .sort((a, b) => (b.lastMessageAt?.toDate?.()?.getTime() ?? 0) - (a.lastMessageAt?.toDate?.()?.getTime() ?? 0));
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Message))
    .sort((a, b) => {
      const aMs = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const bMs = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return aMs - bMs;
    });
}

// ── Prompts ──────────────────────────────────────────────────────────

export async function getPromptCategories(): Promise<PromptCategory[]> {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('order')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PromptCategory));
}

export function subscribePrompts(cb: (prompts: Prompt[]) => void) {
  const q = query(collection(db, 'prompts'), where('status', 'in', ['active', 'suggested']));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prompt))));
}

export async function getActivePrompts(): Promise<Prompt[]> {
  const q = query(collection(db, 'prompts'), where('status', '==', 'active'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prompt));
}

export async function getClaimsForGrandparent(grandparentId: string): Promise<PromptClaim[]> {
  const q = query(collection(db, 'promptClaims'), where('grandparentId', '==', grandparentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PromptClaim));
}

export function subscribeClaimsForGrandparent(grandparentId: string, cb: (claims: PromptClaim[]) => void) {
  const q = query(collection(db, 'promptClaims'), where('grandparentId', '==', grandparentId));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromptClaim))));
}

export async function addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'prompts'), { ...prompt, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updatePromptStatus(promptId: string, status: PromptStatus, approvedBy?: string) {
  const updates: Record<string, unknown> = { status };
  if (approvedBy) updates.approvedBy = approvedBy;
  await updateDoc(doc(db, 'prompts', promptId), updates);
}

export async function deletePrompt(promptId: string) {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'prompts', promptId));
}

export async function updatePrompt(promptId: string, updates: Partial<Prompt>) {
  await updateDoc(doc(db, 'prompts', promptId), updates as Record<string, unknown>);
}

// ── Seed data (called once by parent on first setup) ─────────────────

export async function seedPromptsAndCategories(
  categories: PromptCategory[],
  prompts: Omit<Prompt, 'id' | 'createdAt'>[],
) {
  const batch = writeBatch(db);
  for (const cat of categories) {
    const ref = doc(db, 'categories', cat.id);
    batch.set(ref, { nameEn: cat.nameEn, nameZh: cat.nameZh, icon: cat.icon, order: cat.order });
  }
  for (const prompt of prompts) {
    const ref = doc(collection(db, 'prompts'));
    batch.set(ref, { ...prompt, createdAt: serverTimestamp(), approvedBy: null });
  }
  await batch.commit();
}

export async function isSeeded(): Promise<boolean> {
  const snap = await getDocs(query(collection(db, 'categories'), limit(1)));
  return !snap.empty;
}

// ── Notifications (in-app via Firestore) ─────────────────────────────

export async function createNotification(userId: string, type: string, conversationId: string, text: string) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    type,
    conversationId,
    text,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeUnreadCount(userId: string, cb: (count: number) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  return onSnapshot(q, snap => cb(snap.size));
}

export async function markNotificationsRead(userId: string) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true }));
  await batch.commit();
}
