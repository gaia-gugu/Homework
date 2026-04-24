import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { MessageBubble } from '../../components/common/MessageBubble';
import { subscribeConversation, subscribeMessages } from '../../lib/db';
import type { Conversation, Message } from '../../types';

export function ParentConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { language } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    const unsub1 = subscribeConversation(conversationId, setConversation);
    const unsub2 = subscribeMessages(conversationId, setMessages);
    return () => { unsub1(); unsub2(); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        title={conversation ? `${conversation.grandchildName} ↔ ${conversation.grandparentTitle}` : '…'}
        subtitle={conversation?.title}
        showBack
        backTo="/parent/conversations"
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-10 max-w-lg mx-auto w-full">
        <div className="mb-3 text-center">
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${conversation?.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {conversation?.status === 'open' ? (language === 'zh' ? '进行中' : 'Open') : (language === 'zh' ? '已关闭' : 'Closed')}
          </span>
        </div>
        {messages.map(m => (
          <MessageBubble
            key={m.id}
            message={m}
            isMine={false}
            myColor={m.senderRole === 'grandchild' ? '#7c3aed' : '#2563eb'}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
