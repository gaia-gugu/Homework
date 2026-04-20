import { useState } from 'react';
import type { Subject } from '../types';
import { SUBJECTS } from '../constants';
import './AddTaskModal.css';

interface Props {
  onAdd: (data: { title: string; subject: Subject; dueDate: string; notes?: string }) => void;
  onClose: () => void;
}

const SUBJECT_KEYS = Object.keys(SUBJECTS) as Subject[];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AddTaskModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('chinese');
  const [dueDate, setDueDate] = useState(todayISO());
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), subject, dueDate, notes: notes.trim() || undefined });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet anim-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">Add Homework ✏️</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label htmlFor="task-title">What's the homework?</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Math worksheet page 5"
              autoFocus
              autoComplete="off"
              maxLength={80}
            />
          </div>

          <div className="form-field">
            <label>Subject</label>
            <div className="subject-picker">
              {SUBJECT_KEYS.map(key => {
                const s = SUBJECTS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`subject-option${subject === key ? ' selected' : ''}`}
                    style={subject === key ? { background: s.bg, borderColor: s.color, color: s.color } : {}}
                    onClick={() => setSubject(key)}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-due">Due date</label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                min={todayISO()}
              />
            </div>

            <div className="form-field form-field--stars">
              <label>Stars</label>
              <div className="stars-preview">
                {dueDate === todayISO() ? '⭐⭐' : '⭐'}
                <span>{dueDate === todayISO() ? '+2 today!' : '+1 star'}</span>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="task-notes">Notes (optional)</label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any extra details?"
              rows={2}
              maxLength={200}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit" disabled={!title.trim()}>
              Add Task ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
