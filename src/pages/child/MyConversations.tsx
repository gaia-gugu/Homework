import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { ConversationCard } from '../../components/common/ConversationCard';
import { subscribeChildConversations } from '../../lib/db';
import type { Conversation } from '../../types';

export function ChildMyConversations() {
  const { user, language } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeChildConversations(user.id, setConversations);
  }, [user]);

  const open   = conversations.filter(c => c.status === 'open');
  const closed = conversations.filter(c => c.status === 'closed');

  const t = {
    title:   language === 'zh' ? '我的聊天记录' : 'My Conversations',
    open:    language === 'zh' ? '进行中' : 'Open',
    closed:  language === 'zh' ? '已关闭' : 'Closed',
    empty:   language === 'zh' ? '还没有聊天记录' : 'No conversations yet',
    emptySub: language === 'zh' ? '点击首页的按钮开始提问吧！' : 'Go back and ask a grandparent a question!',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={t.title} showBack backTo="/child" />
      <div className="px-4 py-4 space-y-5 max-w-lg mx-auto pb-10">
        {conversations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-bold text-gray-700">{t.empty}</p>
            <p className="text-sm text-gray-400 mt-1">{t.emptySub}</p>
          </div>
        )}

        {open.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{t.open}</h2>
            <div className="space-y-2">
              {open.map(c => (
                <ConversationCard key={c.id} conversation={c} viewAs="grandchild" linkTo={`/child/conversation/${c.id}`} />
              ))}
            </div>
          </section>
        )}

        {closed.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{t.closed}</h2>
            <div className="space-y-2">
              {closed.map(c => (
                <ConversationCard key={c.id} conversation={c} viewAs="grandchild" linkTo={`/child/conversation/${c.id}`} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
