import { useState } from 'react';
import type { ViewTab } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTasks } from './hooks/useTasks';
import { SetupScreen } from './components/SetupScreen';
import { Header } from './components/Header';
import { FilterTabs } from './components/FilterTabs';
import { TaskList } from './components/TaskList';
import { AddTaskModal } from './components/AddTaskModal';
import { StarBurst } from './components/StarBurst';
import './styles/global.css';
import './styles/animations.css';
import './App.css';

interface Profile {
  kidName: string;
  kidEmoji: string;
}

export default function App() {
  const [profile, setProfile] = useLocalStorage<Profile | null>('hw_profile_v1', null);
  const [tab, setTab] = useState<ViewTab>('today');
  const [showAdd, setShowAdd] = useState(false);
  const [celebration, setCelebration] = useState<{ starsWon: number } | null>(null);

  const { totalStars, addTask, completeTask, deleteTask, filterTasks } = useTasks();

  function handleSetup(name: string, emoji: string) {
    setProfile({ kidName: name, kidEmoji: emoji });
  }

  function handleReset() {
    if (window.confirm('Switch profiles? Your homework will still be saved.')) {
      setProfile(null);
    }
  }

  function handleComplete(id: string) {
    const starsWon = completeTask(id);
    if (starsWon > 0) {
      setCelebration({ starsWon });
    }
  }

  if (!profile) {
    return <SetupScreen onSetup={handleSetup} />;
  }

  const todayTasks  = filterTasks('today');
  const allTasks    = filterTasks('all');
  const doneTasks   = filterTasks('done');
  const visibleTasks = tab === 'today' ? todayTasks : tab === 'all' ? allTasks : doneTasks;

  const counts = {
    today: todayTasks.length,
    all:   allTasks.length,
    done:  doneTasks.length,
  };

  return (
    <div className="app-layout">
      <Header
        kidName={profile.kidName}
        kidEmoji={profile.kidEmoji}
        totalStars={totalStars}
        onReset={handleReset}
      />

      <FilterTabs active={tab} onChange={setTab} counts={counts} />

      <main className="app-main scroll-area">
        <TaskList
          tasks={visibleTasks}
          tab={tab}
          onComplete={handleComplete}
          onDelete={deleteTask}
        />
      </main>

      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add homework">
        +
      </button>

      {showAdd && (
        <AddTaskModal onAdd={addTask} onClose={() => setShowAdd(false)} />
      )}

      {celebration && (
        <StarBurst
          starsWon={celebration.starsWon}
          onDone={() => setCelebration(null)}
        />
      )}
    </div>
  );
}
