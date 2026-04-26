import { useEffect, useState } from 'react';
import { Plus, Check, X, Trash2, Edit2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { subscribePrompts, addPrompt, updatePromptStatus, deletePrompt, updatePrompt, getPromptCategories } from '../../lib/db';
import { CATEGORIES } from '../../constants';
import type { Prompt, PromptCategory } from '../../types';

export function ManagePrompts() {
  const { user, language } = useAuthStore();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>(CATEGORIES);
  const [expandedCat, setExpandedCat] = useState<string | null>(CATEGORIES[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEn, setEditEn] = useState('');
  const [editZh, setEditZh] = useState('');
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [newEn, setNewEn] = useState('');
  const [newZh, setNewZh] = useState('');

  useEffect(() => {
    getPromptCategories().then(cats => cats.length && setCategories(cats));
    return subscribePrompts(setPrompts);
  }, []);

  const suggested = prompts.filter(p => p.status === 'suggested');

  async function approve(p: Prompt) {
    await updatePromptStatus(p.id, 'active', user?.id);
  }
  async function reject(p: Prompt) {
    await updatePromptStatus(p.id, 'rejected');
  }
  async function handleDelete(p: Prompt) {
    if (!window.confirm('Delete this prompt?')) return;
    await deletePrompt(p.id);
  }
  async function handleSaveEdit(p: Prompt) {
    await updatePrompt(p.id, { textEn: editEn, textZh: editZh });
    setEditingId(null);
  }
  async function handleAdd(categoryId: string) {
    if (!newEn.trim()) return;
    await addPrompt({ categoryId, textEn: newEn.trim(), textZh: newZh.trim() || newEn.trim(), grandparentId: null, status: 'active', suggestedBy: null, approvedBy: user?.id ?? null });
    setNewEn(''); setNewZh(''); setShowAdd(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={language === 'zh' ? '管理问题库' : 'Manage Prompts'} showBack backTo="/parent" />
      <div className="px-4 py-4 max-w-2xl mx-auto pb-10 space-y-4">

        {/* Pending suggestions */}
        {suggested.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider px-1 mb-2 flex items-center gap-1">
              ⏳ {language === 'zh' ? '待审核建议' : 'Pending Suggestions'} ({suggested.length})
            </h2>
            <div className="space-y-2">
              {suggested.map(p => (
                <div key={p.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-800 font-medium mb-1">{p.textEn}</p>
                  {p.textZh && p.textZh !== p.textEn && <p className="text-xs text-gray-500 mb-2">{p.textZh}</p>}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => approve(p)} className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-bold flex items-center justify-center gap-1">
                      <Check size={14} /> {language === 'zh' ? '批准' : 'Approve'}
                    </button>
                    <button onClick={() => reject(p)} className="flex-1 py-2 rounded-xl bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center gap-1">
                      <X size={14} /> {language === 'zh' ? '拒绝' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active prompts by category */}
        {categories.map(cat => {
          const catPrompts = prompts.filter(p => p.categoryId === cat.id && p.status === 'active');
          const isOpen = expandedCat === cat.id;
          return (
            <div key={cat.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="font-bold text-gray-700 flex-1">
                  {language === 'zh' ? cat.nameZh : cat.nameEn}
                </span>
                <span className="text-xs text-gray-400">{catPrompts.length}</span>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {catPrompts.map(p => (
                    <div key={p.id} className="border-b border-gray-50 px-4 py-3">
                      {editingId === p.id ? (
                        <div className="space-y-2">
                          <input value={editEn} onChange={e => setEditEn(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" placeholder="English" />
                          <input value={editZh} onChange={e => setEditZh(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" placeholder="Chinese" />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(p)} className="flex-1 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold flex items-center justify-center gap-1"><Save size={12} /> Save</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs"><X size={12} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{p.textEn}</p>
                            {p.textZh && p.textZh !== p.textEn && <p className="text-xs text-gray-400 mt-0.5">{p.textZh}</p>}
                          </div>
                          <button onClick={() => { setEditingId(p.id); setEditEn(p.textEn); setEditZh(p.textZh); }} className="p-1 text-gray-300 hover:text-gray-500"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(p)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add prompt */}
                  {showAdd === cat.id ? (
                    <div className="p-4 space-y-2 bg-gray-50">
                      <input value={newEn} onChange={e => setNewEn(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" placeholder="English question *" />
                      <input value={newZh} onChange={e => setNewZh(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" placeholder="Chinese translation (optional)" />
                      <div className="flex gap-2">
                        <button onClick={() => handleAdd(cat.id)} disabled={!newEn.trim()} className="flex-1 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold disabled:opacity-50">Add</button>
                        <button onClick={() => { setShowAdd(null); setNewEn(''); setNewZh(''); }} className="px-3 py-2 rounded-xl bg-gray-200 text-gray-600 text-sm"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAdd(cat.id)} className="w-full flex items-center justify-center gap-1.5 py-3 text-sm text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                      <Plus size={14} /> {language === 'zh' ? '添加问题' : 'Add question'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
