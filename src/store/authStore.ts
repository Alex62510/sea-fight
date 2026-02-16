import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  isChecking: boolean;
  setIsChecking: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isChecking: true,
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null }),
  setIsChecking: (value) => set({ isChecking: value }),
}));
