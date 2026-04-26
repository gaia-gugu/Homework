import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/common/Avatar';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { logoutUser } from '../../lib/auth';
import { getOpenConversation, subscribeChildConversations } from '../../lib/db';
import { getUsersByRole } from '../../lib/auth';
import type { AppUser, Conversation, GrandparentTitle } from '../../types';
import { gpColorFromTitle, gpEmojiFromTitle } from '../../constants';

export function ChildHome() {
  const { user, setUser, language } = useAuthStore();
  const navigate = useNavigate();
  const [grandparents, setGrandparents] = useState<AppUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [openConvs, setOpenConvs] = useState<Record<string, Conversation | null>>({});

  useEffect(() => {
    getUsersByRole('grandparent').then(setGrandparents);
  }, []);

  useEffect(() => {
    if (!user) return;
    return subscribeChildConversations(user.id, setConversations);
  }, [user]);

  useEffect(() => {
    if (!user || grandparents.length === 0) return;
    grandparents.forEach(gp => {
      getOpenConversation(user.id, gp.id).then(conv => {
        setOpenConvs(prev => ({ ...prev, [gp.id]: conv }));
      });
    });
  }, [user, grandparents, conversations]);

  const t = {
    hello:        language === 'zh' ? `你好，${user?.displayName}！` : `Hello, ${user?.displayName}! 👋`,
    tagline:      language === 'zh' ? '今天想问谁什么问题？' : "Who would you like to talk to today?",
    ask:          language === 'zh' ? '聊天' : 'Ask',
    continue:     language === 'zh' ? '继续聊天' : 'Continue',
    myConvs:      language === 'zh' ? '我的聊天记录' : 'My Conversations',
    myConvsDesc:  language === 'zh' ? '查看所有聊天' : 'See all your chats',
    unread:       language === 'zh' ? '条未读' : 'unread',
  };

  const unreadCount = conversations.filter(c => c.unreadGrandchild).length;

  const resolveTitle = (gp: AppUser): GrandparentTitle | undefined =>
    user?.grandparentTitleOverrides?.[gp.id] ?? gp.grandparentTitle;

  const visibleGrandparents = user?.allowedGrandparentIds && user.allowedGrandparentIds.length > 0
    ? grandparents.filter(gp => user.allowedGrandparentIds!.includes(gp.id))
    : grandparents;

  async function handleAsk(gp: AppUser) {
    const open = openConvs[gp.id];
    if (open) {
      navigate(`/child/conversation/${open.id}`);
    } else {
      navigate(`/child/ask/${gp.id}`);
    }
  }

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 flex items-start justify-between">
        <div>
          <p className="text-2xl font-black text-gray-800 leading-tight">{t.hello}</p>
          <p className="text-gray-500 mt-0.5">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user && <Avatar name={user.displayName} color={user.color} avatar={user.avatar} size="sm" />}
        </div>
      </header>

      <main className="px-5 space-y-4 pb-10 max-w-lg mx-auto">
        {/* Grandparent buttons */}
        {visibleGrandparents
          .sort((a, b) => (a.grandparentTitle === '公公' ? -1 : 1) - (b.grandparentTitle === '公公' ? -1 : 1))
          .map(gp => {
            const open = openConvs[gp.id];
            const title = resolveTitle(gp);
            const color = gpColorFromTitle(title);
            const isGrandpa = title === '公公';
            return (
              <button
                key={gp.id}
                onClick={() => handleAsk(gp)}
                className="w-full text-left rounded-3xl p-5 flex items-center gap-4 shadow-card-lg transition-all active:scale-[0.97] hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)`, border: `2px solid ${color}25` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
                  style={{ backgroundColor: color + '20' }}
                >
                  {gpEmojiFromTitle(title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black" style={{ color }}>
                      {title}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">{gp.displayName}</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: color + 'cc' }}>
                    {open
                      ? (language === 'zh' ? '💬 继续聊天中的话题' : '💬 Continue your conversation')
                      : (language === 'zh' ? `✨ ${isGrandpa ? '问公公' : `问${title}`}一个问题` : `✨ Ask ${title} a question`)}
                  </p>
                </div>
                <ChevronRight size={20} style={{ color: color + '80' }} />
              </button>
            );
          })}

        {/* My Conversations */}
        <button
          onClick={() => navigate('/child/conversations')}
          className="w-full text-left rounded-3xl p-5 flex items-center gap-4 bg-white shadow-card transition-all active:scale-[0.97] hover:shadow-card-lg border-2 border-gray-100"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
            <div className="relative">
              <BookOpen size={28} className="text-primary-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-black text-gray-800 text-lg">{t.myConvs}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} ${t.unread}`
                : t.myConvsDesc}
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        {/* Illustration / decoration */}
        <div className="text-center py-4 opacity-60">
          <p className="text-4xl mb-2">📖 ✨ 💬</p>
          <p className="text-xs text-gray-400">
            {language === 'zh' ? '每一个问题都是一个珍贵的故事' : 'Every question unlocks a precious story'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 text-xs text-gray-300 hover:text-gray-400 transition-colors"
        >
          {language === 'zh' ? '退出登录' : 'Sign out'}
        </button>
      </main>
    </div>
  );
}
