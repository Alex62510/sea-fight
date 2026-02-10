import { create } from 'zustand';
import type { User } from '../types/models.ts';
import { devtools } from 'zustand/middleware';

interface UserState {
  currentUser: User | null;
  users: User[];
  friends: User[];
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  addFriend: (user: User) => void;
  statuses: Record<number, 'online' | 'offline' | 'in-game'>;
  setStatusesRaw: (statuses: { id: number; status: 'online' | 'offline' | 'in-game' }[]) => void;
  resetStatuses: () => void;
  setStatus: (id: number, status: 'online' | 'offline' | 'in-game') => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      currentUser: null,
      users: [],
      friends: [],
      statuses: {},

      setCurrentUser: (user) => set({ currentUser: user }, false, 'auth/setCurrentUser'),

      setUsers: (users) => set({ users }, false, 'users/setUsers'),

      setStatusesRaw: (statuses) =>
        set((state) => {
          const raw = Object.fromEntries(statuses.map((s) => [s.id, s.status]));

          const mapped: Record<number, any> = {};
          state.users.forEach((u) => {
            mapped[u.id] = raw[u.id] ?? 'offline';
          });

          return {
            statusesRaw: raw,
            statuses: mapped,
          };
        }),
      addFriend: (user) =>
        set((state) => ({ friends: [...state.friends, user] }), false, 'friends/addFriend'),

      resetStatuses: () => set({ statuses: {} }, false, 'users/resetStatuses'),
      setStatus: (id: number, status: 'online' | 'offline' | 'in-game') =>
        set((state) => ({
          statuses: { ...state.statuses, [id]: status },
        })),
      logout: () => set({ currentUser: null }, false, 'auth/logout'),
    }),
    { name: 'User Store' },
  ),
);
