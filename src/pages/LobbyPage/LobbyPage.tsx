import UserList from '../../components/UserList';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '../../services/authApi.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { useLoadUsers } from '../../hooks/useLoadUsers.tsx';
import { disconnectLobby, getLobbySocket } from '../../services/lobbySocket.ts';
import { useLobbySocket } from '../../hooks/useLobbySocket.ts';
import { useEffect } from 'react';

const LobbyPage = () => {
  const { users, setStatusesRaw, setCurrentUser, currentUser, resetStatuses } = useUserStore();
  const setToken = useAuthStore((s) => s.setAccessToken);
  const navigate = useNavigate();
  useLoadUsers();

  useLobbySocket(currentUser?.id ?? null);

  const logout = async () => {
    const socket = getLobbySocket();
    if (socket && currentUser?.id) {
      socket.emit('logout', currentUser.id);
    }
    disconnectLobby();
    try {
      await logoutApi();
    } catch (e) {
      console.warn('Logout failed on backend, clearing locally', e);
    } finally {
      setToken(null);
      setCurrentUser(null);
      resetStatuses();
      navigate('/login');
    }
  };

  useEffect(() => {
    if (users.length) {
      const initialStatuses = users.map((u) => ({ id: u.id, status: 'offline' as const }));
      setStatusesRaw(initialStatuses);
    }
  }, [users, setStatusesRaw]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center relative">
      <div className="w-full max-w-4xl p-6">
        {/* Заголовок + кнопка логаута */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center flex-1">⚓ Морской бой</h1>

          <button
            onClick={logout}
            className="ml-4 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition flex items-center justify-center cursor-pointer transition-all animate-pulse hover:scale-105"
            title="Выйти"
          >
            {/* Иконка выхода */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v1"
              />
            </svg>
          </button>
        </div>

        <UserList />
      </div>
    </div>
  );
};

export default LobbyPage;
