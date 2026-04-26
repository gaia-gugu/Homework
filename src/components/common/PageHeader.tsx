import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  showLogout?: boolean;
  right?: React.ReactNode;
  color?: string;
}

export function PageHeader({ title, subtitle, showBack, backTo, showLogout, right, color = '#7c3aed' }: PageHeaderProps) {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => backTo ? navigate(backTo) : navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} style={{ color }} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-800 text-lg leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
        </div>
        {right}
        {showLogout && (
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
