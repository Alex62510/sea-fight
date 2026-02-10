import { useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { refreshTokenApi } from '../services/authApi';

export const useAuthRefresh = () => {
  const setUser = useUserStore((s) => s.setCurrentUser);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setToken = useAuthStore((s) => s.setAccessToken);

  const isRefreshing = useRef(false);

  useEffect(() => {
    // ⛔ если токен уже есть — refresh не нужен
    if (accessToken) return;

    // ⛔ защита от повторных вызовов
    if (isRefreshing.current) return;

    isRefreshing.current = true;

    const refresh = async () => {
      try {
        const data = await refreshTokenApi();
        setToken(data.accessToken);
        setUser(data.user);
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        isRefreshing.current = false;
      }
    };

    refresh();
  }, [accessToken, setToken, setUser]);
};
