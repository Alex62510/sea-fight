import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useUserStore } from '../store/userStore';
import { acceptGame, inviteGame } from '../services/lobbySocket';
import { useLobbySocket } from '../hooks/useLobbySocket';

const statusStyles = {
  online: 'text-green-400',
  offline: 'text-gray-400',
  'in-game': 'text-yellow-400',
};

const UserList = () => {
  const { users, currentUser, statuses } = useUserStore();
  const navigate = useNavigate();

  // Входящее приглашение
  const [incomingInvite, setIncomingInvite] = useState<number | null>(null);
  // Лоадер ожидания, когда отправили приглашение
  const [waitingForPlayer, setWaitingForPlayer] = useState<number | null>(null);

  // Подключаем сокеты и подписываемся на события
  useLobbySocket(currentUser?.id ?? null, {
    onInvite: (from: number) => {
      console.log('[UserList] onInvite', from);
      setIncomingInvite(from);
    },
    onStart: (gameId: string) => {
      setIncomingInvite(null);
      setWaitingForPlayer(null);
      navigate(`/game/${gameId}`);
    },
    onAccepted: ({ from, gameId }: { from: number; gameId: string }) => {
      console.log('[UserList] onAccepted', from, gameId);
      setWaitingForPlayer(null);
      navigate(`/game/${gameId}`);
    },
  });

  // Отправка приглашения
  const handleInvite = (userId: number) => {
    inviteGame(userId);
    setWaitingForPlayer(userId); // ждём игрока
  };

  // Принять приглашение
  const handleAcceptInvite = () => {
    if (incomingInvite !== null && currentUser) {
      acceptGame(incomingInvite, currentUser.id);
      setIncomingInvite(null);
    }
  };

  // Отклонить приглашение
  const handleRejectInvite = () => {
    setIncomingInvite(null);
  };

  return (
    <div className="space-y-3 relative">
      {/* Модалка входящего приглашения */}
      {incomingInvite !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg flex flex-col gap-4 items-center">
            <p className="text-white">Пользователь {incomingInvite} приглашает вас в игру</p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
                onClick={handleAcceptInvite}
              >
                Принять
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
                onClick={handleRejectInvite}
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Лоадер ожидания игрока */}
      {waitingForPlayer !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg flex flex-col gap-4 items-center">
            <p className="text-white">Ждём игрока {waitingForPlayer}...</p>
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Список пользователей */}
      {users.map((user) => {
        const status = statuses[user.id] ?? 'offline';

        return (
          <div
            key={user.id}
            className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-800 rounded-xl p-4 shadow-md transition group overflow-hidden"
          >
            <span className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/30 via-white/20 to-purple-500/30 opacity-0 blur-2xl group-hover:opacity-100 group-hover:animate-[shine_2s_linear_infinite] pointer-events-none" />

            <div className="relative z-10">
              <p className="text-lg font-semibold">{user.username}</p>
              <p className={clsx('text-sm', statusStyles[status])}>
                <span
                  className={clsx(
                    'relative px-3 py-0.5 rounded-full text-xs font-medium inline-block',
                    {
                      'bg-green-500/20 text-green-300': status === 'online',
                      'bg-yellow-500/20 text-yellow-300': status === 'in-game',
                      'bg-gray-500/20 text-gray-400': status === 'offline',
                    },
                  )}
                >
                  {status}
                </span>
              </p>

              {/* Добавляем статистику */}
              <p className="text-xs text-slate-300 mt-1">
                🏆 Победы: {user.wins ?? 0} &nbsp; | &nbsp; 💀 Поражения: {user.loses ?? 0}
              </p>
            </div>

            {user.id !== currentUser?.id && (
              <div className="relative z-10 flex gap-2 mt-2 sm:mt-0">
                {/*<button*/}
                {/*  onClick={() => addFriend(user)}*/}
                {/*  className="relative group px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm transition active:scale-95 cursor-pointer"*/}
                {/*>*/}
                {/*  <span className="absolute -inset-2 rounded-xl bg-gradient-to-r from-transparent via-white/40 to-transparent blur-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse pointer-events-none" />*/}
                {/*  В друзья*/}
                {/*</button>*/}

                {status === 'online' && (
                  <button
                    className="relative group px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm transition active:scale-95 cursor-pointer"
                    onClick={() => handleInvite(user.id)}
                  >
                    <span className="absolute -inset-2 rounded-xl bg-gradient-to-r from-transparent via-white/40 to-transparent blur-md opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" />
                    Играть
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {users.length === 0 && <p className="text-center text-slate-400">Нет доступных игроков</p>}
    </div>
  );
};

export default UserList;
