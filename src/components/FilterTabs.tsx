import type { ViewTab } from '../types';
import './FilterTabs.css';

interface Props {
  active: ViewTab;
  onChange: (tab: ViewTab) => void;
  counts: { today: number; all: number; done: number };
}

const TABS: { key: ViewTab; label: string; emoji: string }[] = [
  { key: 'today', label: 'Today', emoji: '🌟' },
  { key: 'all',   label: 'All',   emoji: '📋' },
  { key: 'done',  label: 'Done',  emoji: '✅' },
];

export function FilterTabs({ active, onChange, counts }: Props) {
  return (
    <div className="filter-tabs">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`filter-tab${active === tab.key ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-emoji">{tab.emoji}</span>
          <span className="tab-label">{tab.label}</span>
          {counts[tab.key] > 0 && (
            <span className="tab-badge">{counts[tab.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
