import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { ConversationCard } from '../../components/common/ConversationCard';
import { subscribeAllConversations } from '../../lib/db';
import type { Conversation } from '../../types';

export function AllConversations() {
  const { language } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filterGp, setFilterGp] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => subscribeAllConversations(setConversations), []);

  const grandparentTitles = Array.from(new Set(conversations.map(c => c.grandparentTitle)));

  const filtered = conversations.filter(c => {
    const gpMatch = filterGp === 'all' || c.grandparentTitle === filterGp;
    const statusMatch = filterStatus === 'all' || c.status === filterStatus;
    return gpMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={language === 'zh' ? '所有对话' : 'All Conversations'} showBack backTo="/parent" />
      <div className="px-4 pt-3 pb-1 space-y-2 max-w-2xl mx-auto">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterGp('all')} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterGp === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {language === 'zh' ? '全部' : 'All'}
          </button>
          {grandparentTitles.map(t => (
            <button key={t} onClick={() => setFilterGp(t)} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterGp === t ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'closed'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterStatus === s ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {s === 'all' ? (language === 'zh' ? '全部' : 'All') : s === 'open' ? (language === 'zh' ? '进行中' : 'Open') : (language === 'zh' ? '已关闭' : 'Closed')}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 space-y-2 max-w-2xl mx-auto pb-10">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">{language === 'zh' ? '暂无对话' : 'No conversations'}</p>
          </div>
        )}
        {filtered.map(c => (
          <ConversationCard
            key={c.id}
            conversation={c}
            viewAs="parent"
            linkTo={`/parent/conversation/${c.id}`}
          />
        ))}
      </div>
    </div>
  );
}
