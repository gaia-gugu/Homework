import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';
import { PinInput } from '../components/common/PinInput';
import { loginWithPin } from '../lib/auth';
import { useAuthStore } from '../store/authStore';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useAuthStore as useLang } from '../store/authStore';

const ROLE_ROUTES: Record<string, string> = {
  parent:      '/parent',
  grandparent: '/grandparent',
  grandchild:  '/child',
};

export function Login() {
  const [step, setStep] = useState<'username' | 'pin'>('username');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const { language } = useLang();
  const navigate = useNavigate();

  const t = {
    welcome:      language === 'zh' ? '欢迎回来' : 'Welcome Back',
    subtitle:     language === 'zh' ? '家族故事' : 'Family Stories',
    namePlaceholder: language === 'zh' ? '输入您的名字…' : 'Enter your name…',
    next:         language === 'zh' ? '下一步' : 'Continue',
    enterPin:     language === 'zh' ? '输入您的 PIN 码' : 'Enter your PIN',
    back:         language === 'zh' ? '返回' : 'Back',
    wrongPin:     language === 'zh' ? '用户名或 PIN 码错误，请重试' : 'Incorrect username or PIN, please try again',
  };

  async function handlePinComplete(pin: string) {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const user = await loginWithPin(username.trim(), pin);
      setUser(user);
      navigate(ROLE_ROUTES[user.role] ?? '/');
    } catch {
      setError(t.wrongPin);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-primary-600 flex items-center justify-center shadow-lg mb-4">
            <BookOpen size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">{t.subtitle}</h1>
          <p className="text-gray-500 mt-1">{t.welcome}</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-card-lg p-8">
          {step === 'username' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                {language === 'zh' ? '您的名字' : 'Your name'}
              </label>
              <input
                autoFocus
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && username.trim() && setStep('pin')}
                placeholder={t.namePlaceholder}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <button
                onClick={() => { setError(''); setStep('pin'); }}
                disabled={!username.trim()}
                className="mt-5 w-full py-3.5 rounded-2xl bg-primary-600 text-white font-bold text-lg shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-40"
              >
                {t.next}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-center text-gray-600 mb-1">
                {language === 'zh' ? '您好，' : 'Hello, '}<strong>{username}</strong>
              </p>
              <p className="text-center text-sm text-gray-400 mb-6">{t.enterPin}</p>
              <PinInput onComplete={handlePinComplete} disabled={loading} error={error} />
              {loading && (
                <p className="text-center text-sm text-gray-400 mt-4 animate-pulse">
                  {language === 'zh' ? '登录中…' : 'Signing in…'}
                </p>
              )}
              <button
                onClick={() => { setStep('username'); setError(''); }}
                className="mt-6 w-full py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
              >
                {t.back}
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          {language === 'zh'
            ? '不记得 PIN 码？请联系父母。'
            : "Forgotten your PIN? Ask a parent to reset it."}
        </p>
      </div>
    </div>
  );
}
