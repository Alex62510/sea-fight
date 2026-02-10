import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { refreshTokenApi as refreshTokenAPI } from './authApi.ts';

const API_URL = import.meta.env.VITE_API_URL;

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosConfig = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosConfig.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosConfig.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      originalRequest._retry = true;

      try {
        const data = await refreshTokenAPI();

        useAuthStore.getState().setAccessToken(data.accessToken);
        useUserStore.getState().setCurrentUser(data.user);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axiosConfig(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        useUserStore.getState().setCurrentUser(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosConfig;
