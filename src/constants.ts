import type { Subject } from './types';

export const SUBJECTS: Record<Subject, { label: string; emoji: string; color: string; bg: string }> = {
  chinese:        { label: 'Chinese',       emoji: '🈶', color: '#dc2626', bg: '#fee2e2' },
  english:        { label: 'English',       emoji: '🔤', color: '#2563eb', bg: '#dbeafe' },
  math:           { label: 'Math',          emoji: '📐', color: '#7c3aed', bg: '#ede9fe' },
  reading:        { label: 'Reading',       emoji: '📚', color: '#0284c7', bg: '#e0f2fe' },
  science:        { label: 'Science',       emoji: '🔬', color: '#059669', bg: '#d1fae5' },
  art:            { label: 'Art',           emoji: '🎨', color: '#db2777', bg: '#fce7f3' },
  'social-studies':{ label: 'Social Studies', emoji: '🌍', color: '#ea580c', bg: '#ffedd5' },
  music:          { label: 'Music',         emoji: '🎵', color: '#ca8a04', bg: '#fef9c3' },
  pe:             { label: 'PE',            emoji: '⚽', color: '#dc2626', bg: '#fee2e2' },
  other:          { label: 'Other',         emoji: '✏️', color: '#64748b', bg: '#f1f5f9' },
};

export const AVATAR_EMOJIS = [
  '🦊','🐸','🦄','🐼','🦁','🐯','🐨','🦋',
  '🐙','🦕','🐉','🦚','🐬','🦀','🐧','🐻',
  '🐮','🐷','🐰','🦔','🦦','🦥','🐿️','🦜',
  '🐳','🦈','🦩','🦒','🐘','🐺',
];

export const DEFAULT_STATE = {
  tasks: [],
  totalStars: 0,
  kidName: '',
  kidEmoji: '🦊',
};
