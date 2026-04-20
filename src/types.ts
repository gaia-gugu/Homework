export type Subject =
  | 'chinese'
  | 'english'
  | 'math'
  | 'reading'
  | 'science'
  | 'art'
  | 'social-studies'
  | 'music'
  | 'pe'
  | 'other';

export interface Task {
  id: string;
  title: string;
  subject: Subject;
  dueDate: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface AppState {
  tasks: Task[];
  totalStars: number;
  kidName: string;
  kidEmoji: string;
}

export type ViewTab = 'today' | 'all' | 'done';
