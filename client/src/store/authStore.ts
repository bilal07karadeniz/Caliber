import { create } from 'zustand';
import { authApi, setAccessToken } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data: res } = await authApi.login({ email, password });
    if (res.success) {
      setAccessToken(res.data.accessToken);
      set({ user: res.data.user, isAuthenticated: true });
    }
  },

  register: async (name, email, password, role) => {
    const { data: res } = await authApi.register({ name, email, password, role });
    if (res.success) {
      setAccessToken(res.data.accessToken);
      set({ user: res.data.user, isAuthenticated: true });
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    try {
      const { data: res } = await authApi.refresh();
      if (res.success && res.data) {
        setAccessToken(res.data.accessToken);
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    try {
      const { data: res } = await authApi.getMe();
      if (res.success) {
        set({ user: res.data, isAuthenticated: true });
      }
    } catch {}
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
