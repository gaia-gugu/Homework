import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { MessageBubble } from '../../components/common/MessageBubble';
import { MediaInput } from '../../components/common/MediaInput';
import { subscribeConversation, subscribeMessages, sendMessage, closeConversation, markConversationRead } from '../../lib/db';
import type { Conversation, Message } from '../../types';
import { GRANDPA_COLOR, GRANDMA_COLOR } from '../../constants';

export function ChildConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user, language } = useAuthStore();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [closing, setClosing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    const unsub1 = subscribeConversation(conversationId, setConversation);
    const unsub2 = subscribeMessages(conversationId, setMessages);
    markConversationRead(conversationId, 'grandchild');
    return () => { unsub1(); unsub2(); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversation?.unreadGrandchild) {
      markConversationRead(conversationId!, 'grandchild');
    }
  }, [conversation, conversationId]);

  const color = conversation?.grandparentTitle === '公公' ? GRANDPA_COLOR : GRANDMA_COLOR;

  async function handleSend(text: string, type: 'text' | 'photo' | 'voice', mediaUrl?: string) {
    if (!user || !conversationId) return;
    await sendMessage(conversationId, user.id, user.displayName, 'grandchild', text, type, mediaUrl);
  }

  async function handleClose() {
    if (!conversationId || closing) return;
    const confirmed = window.confirm(
      language === 'zh'
        ? '确定要关闭这个话题吗？关闭后可以开始新的问题。'
        : 'Close this conversation? You can start a new topic afterwards.'
    );
    if (!confirmed) return;
    setClosing(true);
    await closeConversation(conversationId);
    navigate('/child');
  }

  const isOpen = conversation?.status === 'open';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        title={conversation?.grandparentTitle ?? '…'}
        subtitle={conversation?.title}
        showBack
        backTo="/child"
        color={color}
        right={
          isOpen ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ backgroundColor: color + '15', color }}
            >
              <Lock size={13} />
              {language === 'zh' ? '关闭话题' : 'Close topic'}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded-xl">
              <Unlock size={12} /> {language === 'zh' ? '已关闭' : 'Closed'}
            </span>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 max-w-lg mx-auto w-full">
        {messages.map(m => (
          <MessageBubble
            key={m.id}
            message={m}
            isMine={m.senderId === user?.id}
            myColor={user?.color ?? '#7c3aed'}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {isOpen && conversationId && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto w-full">
          <MediaInput
            conversationId={conversationId}
            onSend={handleSend}
            accentColor={user?.color ?? color}
            placeholder={language === 'zh' ? '写点什么…' : 'Write a message…'}
          />
        </div>
      )}

      {!isOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate(`/child/ask/${conversation?.grandparentId}`)}
              className="w-full py-3.5 rounded-2xl font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {language === 'zh' ? '开始新话题' : 'Start a new topic'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
