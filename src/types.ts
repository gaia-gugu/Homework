import type { Timestamp } from 'firebase/firestore';

export type Role = 'parent' | 'grandparent' | 'grandchild';
export type ConversationStatus = 'open' | 'closed';
export type MessageType = 'text' | 'photo' | 'voice';
export type PromptStatus = 'active' | 'suggested' | 'rejected';
export type Lang = 'en' | 'zh';

export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  color: string;
  avatar: string;
  email: string;
  language: Lang;
  grandparentTitle?: '公公' | '婆婆';
  notificationEmail?: string;
  pin?: string;
  createdAt: Timestamp;
  createdBy: string;
}

export interface Conversation {
  id: string;
  grandchildId: string;
  grandchildName: string;
  grandchildColor: string;
  grandchildAvatar: string;
  grandparentId: string;
  grandparentName: string;
  grandparentTitle: '公公' | '婆婆';
  promptId: string | null;
  title: string;
  status: ConversationStatus;
  lastMessageAt: Timestamp;
  lastMessageText: string;
  lastMessageBy: string;
  unreadGrandchild: boolean;
  unreadGrandparent: boolean;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'grandchild' | 'grandparent';
  type: MessageType;
  text: string;
  mediaUrl?: string;
  createdAt: Timestamp;
  reactions?: Record<string, string[]>;
}

export interface PromptCategory {
  id: string;
  nameEn: string;
  nameZh: string;
  icon: string;
  order: number;
}

export interface Prompt {
  id: string;
  categoryId: string;
  textEn: string;
  textZh: string;
  grandparentId: string | null;
  status: PromptStatus;
  suggestedBy: string | null;
  approvedBy: string | null;
  createdAt: Timestamp;
}

export interface PromptClaim {
  id: string;
  promptId: string;
  grandparentId: string;
  grandchildId: string;
  grandchildName: string;
  conversationId: string;
  claimedAt: Timestamp;
}

export interface NewConversationPayload {
  grandparentId: string;
  title: string;
  promptId: string | null;
}
