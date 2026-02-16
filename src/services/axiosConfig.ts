import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { refreshTokenApi } from './authApi.ts';

const API_URL = import.meta.env.VITE_API_URL;

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosConfig = axios.create({
  baseURL: API_URL,
  withCredentials: true, // важно для cookie
});

// Добавляем access токен к каждому запросу
axiosConfig.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для 401
axiosConfig.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    // Проверяем что это 401, запрос не повторный и не refresh/login/logout
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      originalRequest._retry = true;
      try {
        // Попытка обновить токен
        const data = await refreshTokenApi();

        useAuthStore.getState().setAccessToken(data.accessToken);
        useUserStore.getState().setCurrentUser(data.user);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        return axiosConfig(originalRequest); // повтор запроса
      } catch {
        // Если refresh упал, просто сбрасываем состояние
        useAuthStore.getState().logout();
        useUserStore.getState().setCurrentUser(null);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosConfig;
