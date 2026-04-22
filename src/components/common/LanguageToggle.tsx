import { useAuthStore } from '../../store/authStore';

export function LanguageToggle() {
  const { language, setLanguage } = useAuthStore();
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 transition-colors"
    >
      {language === 'en' ? '中文' : 'EN'}
    </button>
  );
}
