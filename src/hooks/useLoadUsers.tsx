import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { getUsersApi } from '../services/userApi.ts';
import type { User } from '../types/models.ts';

export const useLoadUsers = () => {
  const setUsers = useUserStore((s) => s.setUsers);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users: User[] = await getUsersApi();
        setUsers(users);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };

    fetchUsers();
  }, []);
};
