import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, BookOpen, ChevronRight, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/common/Avatar';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { logoutUser } from '../../lib/auth';
import { subscribeGrandparentConversations } from '../../lib/db';
import type { Conversation } from '../../types';

export function GrandparentHome() {
  const { user, setUser, language } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeGrandparentConversations(user.id, setConversations);
  }, [user]);

  const unanswered = conversations.filter(c => c.status === 'open' && c.unreadGrandparent);
  const totalOpen  = conversations.filter(c => c.status === 'open');

  const color = user?.color ?? '#2563eb';
  const title = user?.grandparentTitle ?? '';

  const t = {
    hello:      language === 'zh' ? `${title}，您好！` : `Hello, ${title}! 😊`,
    tagline:    language === 'zh' ? '您的孙辈们在等待您的故事' : 'Your grandchildren are waiting for your stories',
    unanswered: language === 'zh' ? '待回复的问题' : 'Questions waiting for you',
    unansweredDesc: (n: number) =>
      language === 'zh' ? `${n} 个问题需要回复` : `${n} question${n !== 1 ? 's' : ''} to answer`,
    myConvs:    language === 'zh' ? '所有聊天记录' : 'My Conversations',
    myConvsDesc: (n: number) =>
      language === 'zh' ? `共 ${n} 个对话` : `${n} conversation${n !== 1 ? 's' : ''} total`,
    suggest:    language === 'zh' ? '建议一个新问题' : 'Suggest a new question',
    suggestDesc: language === 'zh' ? '向父母建议添加到题库' : 'Suggest a question for the library',
  };

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    navigate('/');
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${color}15, #fff 40%, ${color}08)` }}>
      {/* Header */}
      <header className="px-5 pt-10 pb-6 flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-gray-800 leading-tight">{t.hello}</p>
          <p className="text-gray-500 mt-1 text-sm">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <LanguageToggle />
          {user && <Avatar name={user.displayName} color={color} avatar={user.avatar} size="md" />}
        </div>
      </header>

      <main className="px-5 space-y-4 pb-10 max-w-lg mx-auto">
        {/* Unanswered questions — most prominent */}
        <button
          onClick={() => navigate('/grandparent/unanswered')}
          className="w-full text-left rounded-3xl p-5 flex items-center gap-4 shadow-card-lg transition-all active:scale-[0.97] hover:shadow-xl text-white"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <div className="relative">
              <MessageCircle size={30} className="text-white" />
              {unanswered.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow">
                  {unanswered.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xl font-black leading-tight">{t.unanswered}</p>
            <p className="text-sm text-white/80 mt-0.5">{t.unansweredDesc(unanswered.length)}</p>
          </div>
          <ChevronRight size={22} className="text-white/60" />
        </button>

        {/* My Conversations */}
        <button
          onClick={() => navigate('/grandparent/conversations')}
          className="w-full text-left rounded-3xl p-5 flex items-center gap-4 bg-white shadow-card transition-all active:scale-[0.97] hover:shadow-card-lg border-2 border-gray-100"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
            <BookOpen size={28} style={{ color }} />
          </div>
          <div className="flex-1">
            <p className="text-xl font-black text-gray-800">{t.myConvs}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t.myConvsDesc(conversations.length)}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        {/* Suggest a question */}
        <button
          onClick={() => navigate('/grandparent/suggest')}
          className="w-full text-left rounded-3xl p-5 flex items-center gap-4 bg-white shadow-card transition-all active:scale-[0.97] hover:shadow-card-lg border-2 border-dashed border-gray-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
            <Plus size={26} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-black text-gray-700">{t.suggest}</p>
            <p className="text-sm text-gray-400 mt-0.5">{t.suggestDesc}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        {/* Stats decoration */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-card">
          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="px-2">
              <p className="text-2xl font-black" style={{ color }}>{conversations.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{language === 'zh' ? '对话' : 'Chats'}</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-black text-emerald-500">{totalOpen.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{language === 'zh' ? '进行中' : 'Active'}</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-black text-amber-500">{unanswered.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{language === 'zh' ? '待回复' : 'Waiting'}</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="w-full py-2 text-xs text-gray-300 hover:text-gray-400 transition-colors">
          {language === 'zh' ? '退出登录' : 'Sign out'}
        </button>
      </main>
    </div>
  );
}
