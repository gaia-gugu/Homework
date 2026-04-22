import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, MessageSquare, Download, ChevronRight, Bell, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { logoutUser, getAllUsers } from '../../lib/auth';
import { subscribeAllConversations, subscribePrompts } from '../../lib/db';
import type { AppUser, Conversation, Prompt } from '../../types';

export function ParentDashboard() {
  const { user, setUser, language } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => { getAllUsers().then(setUsers); }, []);
  useEffect(() => subscribeAllConversations(setConversations), []);
  useEffect(() => subscribePrompts(setPrompts), []);

  const pendingPrompts = prompts.filter(p => p.status === 'suggested');
  const unreadConvs    = conversations.filter(c => c.unreadGrandchild || c.unreadGrandparent);

  const cards = [
    {
      icon: <Users size={24} />,
      label: language === 'zh' ? '管理账户' : 'Manage Accounts',
      sub: `${users.length} ${language === 'zh' ? '个成员' : 'members'}`,
      route: '/parent/accounts',
      color: '#7c3aed',
      badge: 0,
    },
    {
      icon: <BookOpen size={24} />,
      label: language === 'zh' ? '管理问题库' : 'Manage Prompts',
      sub: `${prompts.filter(p => p.status === 'active').length} ${language === 'zh' ? '个问题' : 'active'}`,
      route: '/parent/prompts',
      color: '#0891b2',
      badge: pendingPrompts.length,
    },
    {
      icon: <MessageSquare size={24} />,
      label: language === 'zh' ? '所有对话' : 'All Conversations',
      sub: `${conversations.length} ${language === 'zh' ? '个对话' : 'total'}`,
      route: '/parent/conversations',
      color: '#16a34a',
      badge: unreadConvs.length,
    },
    {
      icon: <Download size={24} />,
      label: language === 'zh' ? '导出记录' : 'Export Stories',
      sub: language === 'zh' ? '下载 Excel 文件' : 'Download as Excel',
      route: '/parent/export',
      color: '#ea580c',
      badge: 0,
    },
  ];

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 pt-8 pb-5">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Settings size={18} className="text-primary-600" />
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                {language === 'zh' ? '管理员' : 'Admin Panel'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-800">
              {language === 'zh' ? '家族故事管理' : 'Family Stories'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {language === 'zh' ? `欢迎，${user?.displayName}` : `Welcome, ${user?.displayName}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-4">
        {/* Alert: pending prompts */}
        {pendingPrompts.length > 0 && (
          <button
            onClick={() => navigate('/parent/prompts')}
            className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left hover:bg-amber-100 transition-colors"
          >
            <Bell size={18} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              {pendingPrompts.length} {language === 'zh' ? '个问题建议待审核' : 'suggested questions need review'}
            </p>
            <ChevronRight size={16} className="text-amber-400" />
          </button>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: language === 'zh' ? '对话总数' : 'Conversations', value: conversations.length, color: '#16a34a' },
            { label: language === 'zh' ? '进行中' : 'Open', value: conversations.filter(c => c.status === 'open').length, color: '#0891b2' },
            { label: language === 'zh' ? '未读消息' : 'Unread', value: unreadConvs.length, color: '#ea580c' },
            { label: language === 'zh' ? '问题数量' : 'Questions', value: prompts.filter(p => p.status === 'active').length, color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-card text-center">
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 gap-3">
          {cards.map(card => (
            <button
              key={card.route}
              onClick={() => navigate(card.route)}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-card hover:shadow-card-lg transition-all active:scale-[0.98] text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.color + '15', color: card.color }}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{card.label}</p>
                <p className="text-sm text-gray-400">{card.sub}</p>
              </div>
              {card.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {card.badge}
                </span>
              )}
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full py-2 text-xs text-gray-300 hover:text-gray-400 transition-colors mt-4">
          {language === 'zh' ? '退出登录' : 'Sign out'}
        </button>
      </main>
    </div>
  );
}
