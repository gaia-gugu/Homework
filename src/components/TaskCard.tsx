import { useState } from 'react';
import type { Task } from '../types';
import { SubjectBadge } from './SubjectBadge';
import './TaskCard.css';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

function formatDueDate(dateStr: string): { label: string; status: 'overdue' | 'today' | 'future' } {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr < today) {
    const d = new Date(dateStr + 'T12:00:00');
    return { label: `Overdue! (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`, status: 'overdue' };
  }
  if (dateStr === today) return { label: 'Due today!', status: 'today' };
  const d = new Date(dateStr + 'T12:00:00');
  const diff = Math.round((d.getTime() - Date.now()) / 86400000);
  if (diff === 1) return { label: 'Due tomorrow', status: 'future' };
  return { label: `Due ${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, status: 'future' };
}

export function TaskCard({ task, onComplete, onDelete, index }: Props) {
  const [popping, setPopping] = useState(false);
  const due = task.completed ? null : formatDueDate(task.dueDate);

  function handleComplete() {
    if (task.completed) return;
    setPopping(true);
    setTimeout(() => {
      onComplete(task.id);
      setPopping(false);
    }, 350);
  }

  return (
    <div
      className={`task-card${task.completed ? ' completed' : ''}${popping ? ' popping' : ''}${due?.status === 'overdue' ? ' overdue' : ''}`}
      style={{ '--index': index } as React.CSSProperties}
    >
      {due?.status === 'overdue' && <div className="overdue-bar" />}
      <div className="task-card-inner">
        <div className="task-card-left">
          <SubjectBadge subject={task.subject} size="sm" />
          <span className={`task-title${task.completed ? ' done-title' : ''}`}>{task.title}</span>
          {task.notes && !task.completed && (
            <span className="task-notes">{task.notes}</span>
          )}
          {due && (
            <span className={`due-chip due-${due.status}`}>{due.label}</span>
          )}
          {task.completed && task.completedAt && (
            <span className="completed-chip">
              ✅ Done! {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        <div className="task-card-actions">
          {!task.completed && (
            <button
              className="complete-btn"
              onClick={handleComplete}
              aria-label="Mark complete"
            >
              ✓
            </button>
          )}
          <button
            className="delete-btn"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
