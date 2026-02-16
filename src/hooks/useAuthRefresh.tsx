import { useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { refreshTokenApi } from '../services/authApi';

export const useAuthRefresh = () => {
  const setUser = useUserStore((s) => s.setCurrentUser);
  const setToken = useAuthStore((s) => s.setAccessToken);
  const setChecking = useAuthStore((s) => s.setIsChecking);
  const accessToken = useAuthStore((s) => s.accessToken);

  const isRefreshing = useRef(false);

  useEffect(() => {
    const refresh = async () => {
      // Если токен есть — сразу снимаем isChecking
      if (accessToken) {
        setChecking(false);
        return;
      }

      if (isRefreshing.current) return;
      isRefreshing.current = true;

      try {
        const data = await refreshTokenApi();
        setToken(data.accessToken);
        setUser(data.user);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setChecking(false); // флаг снимаем после завершения refresh
        isRefreshing.current = false;
      }
    };

    refresh();
  }, [accessToken, setToken, setUser, setChecking]);
};
