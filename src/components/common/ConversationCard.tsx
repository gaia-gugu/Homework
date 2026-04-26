import { MessageCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Conversation } from '../../types';
import { Avatar } from './Avatar';
import { useAuthStore } from '../../store/authStore';
import { gpColorFromTitle, gpEmojiFromTitle } from '../../constants';

interface ConversationCardProps {
  conversation: Conversation;
  viewAs: 'grandchild' | 'grandparent' | 'parent';
  linkTo: string;
}

function timeAgo(ts: { toDate?: () => Date } | null | undefined): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date();
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function ConversationCard({ conversation: c, viewAs, linkTo }: ConversationCardProps) {
  const navigate = useNavigate();
  const { language } = useAuthStore();
  const isUnread = viewAs === 'grandchild' ? c.unreadGrandchild : viewAs === 'grandparent' ? c.unreadGrandparent : false;

  const displayName = viewAs === 'grandchild' ? c.grandparentName : c.grandchildName;
  const displayColor = viewAs === 'grandchild'
    ? gpColorFromTitle(c.grandparentTitle)
    : c.grandchildColor;
  const displayAvatar = viewAs === 'grandchild' ? gpEmojiFromTitle(c.grandparentTitle) : c.grandchildAvatar;

  return (
    <button
      onClick={() => navigate(linkTo)}
      className={`w-full text-left bg-white rounded-2xl p-4 shadow-card flex items-start gap-3 transition-all active:scale-[0.98] hover:shadow-card-lg ${isUnread ? 'ring-2 ring-primary-400' : ''}`}
    >
      <div className="relative">
        <Avatar name={displayName} color={displayColor} avatar={displayAvatar} size="md" />
        {isUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-gray-800 truncate">{displayName}</span>
          {viewAs === 'parent' && (
            <span className="text-xs text-gray-400">
              {c.grandchildName} ↔ {c.grandparentTitle}
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400 shrink-0">{timeAgo(c.lastMessageAt)}</span>
        </div>
        <p className="text-sm font-semibold text-gray-700 truncate mb-0.5">{c.title}</p>
        <p className={`text-sm truncate ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
          {c.lastMessageText}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {c.status === 'closed' ? (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              <Lock size={10} /> {language === 'zh' ? '已关闭' : 'Closed'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-primary-600 bg-primary-50 rounded-full px-2 py-0.5">
              <MessageCircle size={10} /> {language === 'zh' ? '进行中' : 'Open'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
