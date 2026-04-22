import { Mic, Image as ImageIcon } from 'lucide-react';
import type { Message } from '../../types';

const REACTION_EMOJIS = ['❤️', '😄', '👍', '🥹'];

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  myColor: string;
  currentUserId?: string;
  onReact?: (messageId: string, emoji: string, adding: boolean) => void;
}

function formatTime(ts: { toDate?: () => Date } | null | undefined) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date();
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message: m, isMine, myColor, currentUserId, onReact }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMine && (
          <span className="text-xs text-gray-400 mb-1 ml-1">{m.senderName}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={isMine
            ? { backgroundColor: myColor, color: '#fff' }
            : { backgroundColor: '#f3f4f6', color: '#1f2937' }
          }
        >
          {m.type === 'text' && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{m.text}</p>
          )}
          {m.type === 'photo' && (
            <div>
              {m.mediaUrl
                ? <img src={m.mediaUrl} alt="photo" className="rounded-xl max-w-full max-h-64 object-contain" />
                : <span className="flex items-center gap-2 text-sm"><ImageIcon size={16} /> Photo</span>
              }
              {m.text && <p className="text-sm mt-1 leading-relaxed">{m.text}</p>}
            </div>
          )}
          {m.type === 'voice' && (
            <div>
              {m.mediaUrl
                ? <audio controls src={m.mediaUrl} className="max-w-full" style={{ height: 36 }} />
                : <span className="flex items-center gap-2 text-sm"><Mic size={16} /> Voice message</span>
              }
              {m.text && <p className="text-sm mt-1 leading-relaxed">{m.text}</p>}
            </div>
          )}
        </div>

        <span className="text-xs text-gray-400 mt-1 mx-1">{formatTime(m.createdAt)}</span>

        {/* Reactions */}
        {onReact && currentUserId && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
            {REACTION_EMOJIS.map(emoji => {
              const users = m.reactions?.[emoji] ?? [];
              const hasReacted = users.includes(currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(m.id, emoji, !hasReacted)}
                  className={`text-sm rounded-full px-2 py-0.5 transition-all border ${
                    hasReacted
                      ? 'bg-white border-gray-300 shadow-sm scale-110'
                      : 'bg-transparent border-transparent opacity-30 hover:opacity-70'
                  }`}
                >
                  {emoji}{users.length > 0 ? ` ${users.length}` : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
