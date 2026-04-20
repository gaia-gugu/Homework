import type { Subject } from '../types';
import { SUBJECTS } from '../constants';

interface Props {
  subject: Subject;
  size?: 'sm' | 'md';
}

export function SubjectBadge({ subject, size = 'md' }: Props) {
  const s = SUBJECTS[subject];
  return (
    <span
      className={`subject-badge subject-badge--${size}`}
      style={{ backgroundColor: s.bg, color: s.color, border: `2px solid ${s.color}33` }}
    >
      {s.emoji} {s.label}
    </span>
  );
}
