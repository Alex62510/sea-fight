import axiosConfig from './axiosConfig.ts';
import type { AuthResponse } from '../types/models.ts';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await axiosConfig.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await axiosConfig.post<AuthResponse>('/auth/register', { name, email, password });
  return res.data;
}

export async function refreshTokenApi(): Promise<AuthResponse> {
  const res = await axiosConfig.post<AuthResponse>('/auth/refresh', {}, { withCredentials: true });
  return res.data;
}
export async function logoutApi(): Promise<{ success: true }> {
  const res = await axiosConfig.post<{ success: true }>('/auth/logout');
  return res.data;
}
