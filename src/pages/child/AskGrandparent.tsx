import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Send, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { getUserById } from '../../lib/auth';
import { getActivePrompts, getClaimsForGrandparent, createConversation, getPromptCategories } from '../../lib/db';
import type { AppUser, Prompt, PromptClaim, PromptCategory } from '../../types';
import { gpColorFromTitle, gpEmojiFromTitle } from '../../constants';

export function AskGrandparent() {
  const { grandparentId } = useParams<{ grandparentId: string }>();
  const { user, language } = useAuthStore();
  const navigate = useNavigate();

  const [grandparent, setGrandparent] = useState<AppUser | null>(null);
  const [question, setQuestion] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [claims, setClaims] = useState<PromptClaim[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!grandparentId) return;
    getUserById(grandparentId).then(gp => {
      setGrandparent(gp);
      if (gp) {
        getClaimsForGrandparent(gp.id).then(setClaims);
      }
    });
    getActivePrompts().then(setPrompts);
    getPromptCategories().then(setCategories);
  }, [grandparentId]);

  const title = grandparent
    ? (user?.grandparentTitleOverrides?.[grandparent.id] ?? grandparent.grandparentTitle)
    : undefined;
  const color = gpColorFromTitle(title);
  const emoji = gpEmojiFromTitle(title);

  const claimedPromptIds = new Set(claims.map(c => c.promptId));

  function getClaimInfo(promptId: string): PromptClaim | undefined {
    return claims.find(c => c.promptId === promptId);
  }

  function handleSelectPrompt(p: Prompt) {
    if (claimedPromptIds.has(p.id)) return;
    setSelectedPrompt(p);
    setQuestion(language === 'zh' ? p.textZh : p.textEn);
  }

  async function handleSend() {
    if (!question.trim() || !user || !grandparent || loading) return;
    setLoading(true);
    try {
      const convId = await createConversation(
        user, grandparent,
        { grandparentId: grandparent.id, title: question.trim(), promptId: selectedPrompt?.id ?? null },
        question.trim(),
      );
      navigate(`/child/conversation/${convId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const t = {
    asking:    language === 'zh' ? `问${title}` : `Ask ${title}`,
    question:  language === 'zh' ? '你的问题' : 'Your question',
    placeholder: language === 'zh' ? `你想问${title}什么？` : `What would you like to ask ${title}?`,
    suggested: language === 'zh' ? '或从题库中选一个' : 'Or pick from the question library',
    send:      language === 'zh' ? '发送' : 'Send',
    claimed:   language === 'zh' ? '已被' : 'Asked by',
    available: language === 'zh' ? '可选择' : 'Available',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title={t.asking} showBack backTo="/child" color={color} />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-lg mx-auto w-full pb-32">
        {/* Grandparent card */}
        {grandparent && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: color + '20' }}>
              {emoji}
            </div>
            <div>
              <p className="font-bold text-gray-800">{grandparent.displayName}</p>
              <p className="text-sm" style={{ color }}>
                {language === 'zh' ? `向${title}提问` : `Send a question to ${title}`}
              </p>
            </div>
          </div>
        )}

        {/* Free-form question */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <label className="block text-sm font-semibold text-gray-600 mb-2">{t.question}</label>
          <textarea
            value={question}
            onChange={e => { setQuestion(e.target.value); if (selectedPrompt) setSelectedPrompt(null); }}
            placeholder={t.placeholder}
            rows={3}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-base outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none transition-all"
          />
          {selectedPrompt && (
            <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {language === 'zh' ? '来自题库' : 'From question library'}
              <button onClick={() => { setSelectedPrompt(null); setQuestion(''); }} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </div>

        {/* Prompt library */}
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-2 px-1">{t.suggested}</p>
          <div className="space-y-2">
            {categories.map(cat => {
              const catPrompts = prompts.filter(p =>
                p.categoryId === cat.id && (p.grandparentId === null || p.grandparentId === grandparent?.id)
              );
              if (catPrompts.length === 0) return null;
              const isOpen = expandedCat === cat.id;
              return (
                <div key={cat.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-semibold text-gray-700 flex-1">
                      {language === 'zh' ? cat.nameZh : cat.nameEn}
                    </span>
                    <span className="text-xs text-gray-400">
                      {catPrompts.filter(p => !claimedPromptIds.has(p.id)).length} {t.available}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {catPrompts.map(p => {
                        const claim = getClaimInfo(p.id);
                        const isClaimed = Boolean(claim);
                        const isSelected = selectedPrompt?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelectPrompt(p)}
                            disabled={isClaimed}
                            className={`w-full text-left px-4 py-3 flex items-start gap-2 transition-colors
                              ${isClaimed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 active:bg-gray-100'}
                              ${isSelected ? 'bg-primary-50' : ''}`}
                          >
                            <span className="flex-1 text-sm text-gray-700">
                              {language === 'zh' ? p.textZh : p.textEn}
                            </span>
                            {isClaimed ? (
                              <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                                <Lock size={10} /> {t.claimed} {claim?.grandchildName}
                              </span>
                            ) : isSelected ? (
                              <span className="text-xs shrink-0 font-semibold" style={{ color }}>✓</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Send button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSend}
            disabled={!question.trim() || loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ backgroundColor: color }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {t.send}
          </button>
        </div>
      </div>
    </div>
  );
}
