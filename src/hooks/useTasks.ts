import { useCallback } from 'react';
import type { Task, Subject, ViewTab } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface TasksState {
  tasks: Task[];
  totalStars: number;
}

const INITIAL: TasksState = { tasks: [], totalStars: 0 };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isPast(dateStr: string) {
  return dateStr < todayISO();
}

function isToday(dateStr: string) {
  return dateStr === todayISO();
}

export function useTasks() {
  const [state, setState] = useLocalStorage<TasksState>('hw_tasks_v1', INITIAL);

  const addTask = useCallback((data: { title: string; subject: Subject; dueDate: string; notes?: string }) => {
    const task: Task = {
      id: crypto.randomUUID(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, tasks: [task, ...s.tasks] }));
  }, [setState]);

  const completeTask = useCallback((id: string): number => {
    let starsAwarded = 0;
    setState(s => {
      const tasks = s.tasks.map(t => {
        if (t.id !== id || t.completed) return t;
        starsAwarded = isToday(t.dueDate) || isPast(t.dueDate) ? 2 : 1;
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      });
      return { tasks, totalStars: s.totalStars + starsAwarded };
    });
    return starsAwarded;
  }, [setState]);

  const deleteTask = useCallback((id: string) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  }, [setState]);

  const filterTasks = useCallback((tab: ViewTab): Task[] => {
    const today = todayISO();
    switch (tab) {
      case 'today':
        return state.tasks
          .filter(t => !t.completed && (t.dueDate <= today))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      case 'all':
        return state.tasks
          .filter(t => !t.completed)
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      case 'done':
        return state.tasks
          .filter(t => t.completed)
          .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
    }
  }, [state.tasks]);

  return {
    tasks: state.tasks,
    totalStars: state.totalStars,
    addTask,
    completeTask,
    deleteTask,
    filterTasks,
  };
}
