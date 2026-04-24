import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../../components/common/PageHeader';
import { addPrompt } from '../../lib/db';
import { CATEGORIES } from '../../constants';

export function SuggestPrompt() {
  const { user, language } = useAuthStore();
  const navigate = useNavigate();
  const [textEn, setTextEn] = useState('');
  const [textZh, setTextZh] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!textEn.trim() || !user || loading) return;
    setLoading(true);
    try {
      await addPrompt({
        categoryId,
        textEn: textEn.trim(),
        textZh: textZh.trim() || textEn.trim(),
        grandparentId: null,
        status: 'suggested',
        suggestedBy: user.id,
        approvedBy: null,
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  const color = user?.color ?? '#2563eb';

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PageHeader title={language === 'zh' ? '建议问题' : 'Suggest a Question'} showBack backTo="/grandparent" color={color} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-800 mb-2">
              {language === 'zh' ? '感谢您的建议！' : 'Thank you!'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {language === 'zh'
                ? '您的建议已提交，待父母审核后将加入题库。'
                : 'Your suggestion has been sent to the parents for review.'}
            </p>
            <button onClick={() => navigate('/grandparent')} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ backgroundColor: color }}>
              {language === 'zh' ? '返回首页' : 'Back Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={language === 'zh' ? '建议一个问题' : 'Suggest a Question'} showBack backTo="/grandparent" color={color} />
      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        <p className="text-sm text-gray-500">
          {language === 'zh'
            ? '您觉得孙辈们应该问什么问题？提交后由父母审核后加入题库。'
            : "What question do you think your grandchildren should ask? The parents will review it before adding it."}
        </p>

        <div className="bg-white rounded-2xl p-4 shadow-card space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {language === 'zh' ? '分类' : 'Category'}
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-400 text-sm bg-white"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {language === 'zh' ? c.nameZh : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {language === 'zh' ? '问题（英文）' : 'Question (English)'}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              value={textEn}
              onChange={e => setTextEn(e.target.value)}
              placeholder="e.g. What was your favourite song when you were young?"
              rows={2}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-400 resize-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {language === 'zh' ? '问题（中文，可选）' : 'Question (Chinese, optional)'}
            </label>
            <textarea
              value={textZh}
              onChange={e => setTextZh(e.target.value)}
              placeholder="例：你年轻时最喜欢什么歌曲？"
              rows={2}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-400 resize-none text-sm transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!textEn.trim() || loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          <Send size={20} />
          {language === 'zh' ? '提交建议' : 'Submit Suggestion'}
        </button>
      </div>
    </div>
  );
}
