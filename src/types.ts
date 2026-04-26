import type { Timestamp } from 'firebase/firestore';

export type Role = 'parent' | 'grandparent' | 'grandchild';
export type ConversationStatus = 'open' | 'closed';
export type MessageType = 'text' | 'photo' | 'voice';
export type PromptStatus = 'active' | 'suggested' | 'rejected';
export type Lang = 'en' | 'zh';

export type GrandparentTitle = '公公' | '婆婆' | '嫲嫲' | '姥姥';

export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  color: string;
  avatar: string;
  email: string;
  language: Lang;
  grandparentTitle?: GrandparentTitle;
  notificationEmail?: string;
  pin?: string;
  // Grandchild-only: if set, this grandchild can only message grandparents in this list.
  // Undefined means no restriction (existing behaviour).
  allowedGrandparentIds?: string[];
  // Grandchild-only: per-grandparent display-title override.
  // E.g. cousin sees the paternal grandma as 姥姥 instead of her default 嫲嫲.
  grandparentTitleOverrides?: Record<string, GrandparentTitle>;
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
  grandparentTitle: GrandparentTitle;
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
