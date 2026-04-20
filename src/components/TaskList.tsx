import type { Task, ViewTab } from '../types';
import { TaskCard } from './TaskCard';
import './TaskList.css';

interface Props {
  tasks: Task[];
  tab: ViewTab;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const EMPTY_MESSAGES: Record<ViewTab, { emoji: string; title: string; subtitle: string }> = {
  today:  { emoji: '🎉', title: "You're all caught up!", subtitle: 'Nothing due today. Go play!' },
  all:    { emoji: '✏️', title: 'No tasks yet!',         subtitle: 'Tap the + button to add your first homework.' },
  done:   { emoji: '💪', title: 'Nothing done yet!',     subtitle: 'Complete some tasks to see them here.' },
};

export function TaskList({ tasks, tab, onComplete, onDelete }: Props) {
  if (tasks.length === 0) {
    const msg = EMPTY_MESSAGES[tab];
    return (
      <div className="empty-state">
        <span className="empty-emoji">{msg.emoji}</span>
        <h2>{msg.title}</h2>
        <p>{msg.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, i) => (
        <TaskCard
          key={task.id}
          task={task}
          index={i}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
