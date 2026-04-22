import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser, Lang } from '../types';

interface AuthState {
  user: AppUser | null;
  language: Lang;
  setUser: (user: AppUser | null) => void;
  setLanguage: (lang: Lang) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      language: 'en',
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'fs-auth' }
  )
);
