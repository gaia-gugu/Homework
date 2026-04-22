import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { MessageBubble } from '../../components/common/MessageBubble';
import { MediaInput } from '../../components/common/MediaInput';
import { subscribeConversation, subscribeMessages, sendMessage, closeConversation, markConversationRead } from '../../lib/db';
import type { Conversation, Message } from '../../types';

export function GrandparentConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user, language } = useAuthStore();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    const unsub1 = subscribeConversation(conversationId, setConversation);
    const unsub2 = subscribeMessages(conversationId, setMessages);
    markConversationRead(conversationId, 'grandparent');
    return () => { unsub1(); unsub2(); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversation?.unreadGrandparent) {
      markConversationRead(conversationId!, 'grandparent');
    }
  }, [conversation, conversationId]);

  const color = user?.color ?? '#2563eb';

  async function handleSend(text: string, type: 'text' | 'photo' | 'voice', mediaUrl?: string) {
    if (!user || !conversationId) return;
    await sendMessage(conversationId, user.id, user.displayName, 'grandparent', text, type, mediaUrl);
  }

  async function handleClose() {
    if (!conversationId) return;
    const confirmed = window.confirm(
      language === 'zh'
        ? '确定要关闭这个对话吗？'
        : 'Close this conversation?'
    );
    if (!confirmed) return;
    await closeConversation(conversationId);
    navigate('/grandparent');
  }

  const isOpen = conversation?.status === 'open';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader
        title={conversation?.grandchildName ?? '…'}
        subtitle={conversation?.title}
        showBack
        backTo="/grandparent"
        color={color}
        right={
          isOpen ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ backgroundColor: color + '15', color }}
            >
              <Lock size={13} />
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded-xl">
              <Unlock size={12} /> {language === 'zh' ? '已关闭' : 'Closed'}
            </span>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 max-w-lg mx-auto w-full">
        {messages.length > 0 && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-white text-xs text-gray-400 px-3 py-1 rounded-full shadow-sm">
              {conversation?.grandchildName} {language === 'zh' ? '的提问' : "'s question"}
            </span>
          </div>
        )}
        {messages.map(m => (
          <MessageBubble
            key={m.id}
            message={m}
            isMine={m.senderId === user?.id}
            myColor={color}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {isOpen && conversationId && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto w-full">
          <MediaInput
            conversationId={conversationId}
            onSend={handleSend}
            accentColor={color}
            placeholder={language === 'zh' ? '分享您的故事…' : 'Share your story…'}
          />
        </div>
      )}

      {!isOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto text-center text-sm text-gray-400">
            {language === 'zh' ? '这个对话已关闭' : 'This conversation is closed'}
          </div>
        </div>
      )}
    </div>
  );
}
