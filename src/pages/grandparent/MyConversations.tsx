import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { ConversationCard } from '../../components/common/ConversationCard';
import { subscribeGrandparentConversations } from '../../lib/db';
import type { Conversation } from '../../types';

interface GrandparentMyConversationsProps {
  unansweredOnly?: boolean;
}

export function GrandparentMyConversations({ unansweredOnly }: GrandparentMyConversationsProps) {
  const { user, language } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    if (!user) return;
    return subscribeGrandparentConversations(user.id, setConversations);
  }, [user]);

  const displayConvs = unansweredOnly
    ? conversations.filter(c => c.status === 'open' && c.lastMessageBy === c.grandchildName)
    : conversations.filter(c =>
        filter === 'all' ? true : filter === 'open' ? c.status === 'open' : c.status === 'closed'
      );

  const t = {
    unanswered: language === 'zh' ? '待回复的问题' : 'Questions Waiting',
    myConvs:    language === 'zh' ? '所有聊天记录' : 'My Conversations',
    all:        language === 'zh' ? '全部' : 'All',
    open:       language === 'zh' ? '进行中' : 'Open',
    closed:     language === 'zh' ? '已关闭' : 'Closed',
    empty:      language === 'zh' ? '暂无内容' : 'Nothing here yet',
    emptyUnanswered: language === 'zh' ? '您已回复所有问题！' : 'All caught up!',
  };

  const grandchildGroups: Record<string, Conversation[]> = {};
  if (!unansweredOnly) {
    for (const c of displayConvs) {
      if (!grandchildGroups[c.grandchildId]) grandchildGroups[c.grandchildId] = [];
      grandchildGroups[c.grandchildId].push(c);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={unansweredOnly ? t.unanswered : t.myConvs}
        showBack
        backTo="/grandparent"
        color={user?.color}
      />

      {!unansweredOnly && (
        <div className="px-4 pt-3 pb-1 flex gap-2 max-w-lg mx-auto">
          {(['all', 'open', 'closed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
              style={filter === f ? { backgroundColor: user?.color } : {}}
            >
              {t[f]}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto pb-10">
        {displayConvs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{unansweredOnly ? '✅' : '💬'}</p>
            <p className="font-bold text-gray-600">
              {unansweredOnly ? t.emptyUnanswered : t.empty}
            </p>
          </div>
        )}

        {unansweredOnly ? (
          displayConvs.map(c => (
            <ConversationCard
              key={c.id}
              conversation={c}
              viewAs="grandparent"
              linkTo={`/grandparent/conversation/${c.id}`}
            />
          ))
        ) : (
          Object.entries(grandchildGroups).map(([, convs]) => (
            <div key={convs[0].grandchildId} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: convs[0].grandchildColor + '20', color: convs[0].grandchildColor }}
                >
                  {convs[0].grandchildAvatar} {convs[0].grandchildName}
                </span>
              </div>
              {convs.map(c => (
                <ConversationCard
                  key={c.id}
                  conversation={c}
                  viewAs="grandparent"
                  linkTo={`/grandparent/conversation/${c.id}`}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
