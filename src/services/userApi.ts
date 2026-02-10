import axiosConfig from './axiosConfig.ts';
import type { User } from '../types/models.ts';

// Получить всех пользователей
export async function getUsersApi(): Promise<User[]> {
  const res = await axiosConfig.get<User[]>('/users');
  return res.data;
}

// Получить конкретного пользователя по ID
export async function getUserByIdApi(userId: number): Promise<User> {
  const res = await axiosConfig.get<User>(`/users/${userId}`);
  return res.data;
}

// Обновить данные пользователя (например, статус или имя)
export async function updateUserApi(userId: number, data: Partial<User>): Promise<User> {
  const res = await axiosConfig.patch<User>(`/users/${userId}`, data);
  return res.data;
}

// Удалить пользователя
export async function deleteUserApi(userId: number): Promise<{ success: true }> {
  const res = await axiosConfig.delete<{ success: true }>(`/users/${userId}`);
  return res.data;
}
