import { useAuthStore } from '../../store/authStore';
import { updateUserProfile } from '../../lib/auth';
import type { Lang } from '../../types';

export function LanguageToggle() {
  const { user, language, setLanguage } = useAuthStore();

  function handleToggle() {
    const next: Lang = language === 'en' ? 'zh' : 'en';
    setLanguage(next);
    if (user) updateUserProfile(user.id, { language: next });
  }

  return (
    <button
      onClick={handleToggle}
      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 transition-colors"
    >
      {language === 'en' ? '中文' : 'EN'}
    </button>
  );
}
