import { useMemo, useState } from 'react';
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
  const { users, currentUser, statuses, updateCurrentUsername } = useUserStore();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentUser?.name ?? '');
  // Входящее приглашение
  const [incomingInvite, setIncomingInvite] = useState<number | null>(null);
  // Лоадер ожидания, когда отправили приглашение
  const [waitingForPlayer, setWaitingForPlayer] = useState<number | null>(null);

  // Подключаем сокеты и подписываемся на события
  const socketHandlers = useMemo(
    () => ({
      onInvite: (from: number) => {
        setIncomingInvite(from);
      },
      onStart: (gameId: string) => {
        setIncomingInvite(null);
        setWaitingForPlayer(null);
        navigate(`/game/${gameId}`);
      },
      onAccepted: ({ gameId }: { from: number; gameId: string }) => {
        setWaitingForPlayer(null);
        navigate(`/game/${gameId}`);
      },
    }),
    [navigate],
  );

  // Подключаем сокеты и подписываемся на события
  useLobbySocket(currentUser?.id ?? null, socketHandlers);

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

  const saveName = () => {
    if (!tempName.trim() || !currentUser) return;
    if (tempName.trim() === currentUser.name) {
      setEditingName(false);
      return;
    }
    updateCurrentUsername(tempName.trim()).then(() => {
      setEditingName(false);
    });
  };

  return (
    <div className="space-y-3 relative">
      {/* Модалка входящего приглашения */}
      {incomingInvite !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg flex flex-col gap-4 items-center">
            <p className="text-white">
              Игрок {users.find((user) => user.id === incomingInvite)?.name ?? incomingInvite}{' '}
              вызывает вас на бой
            </p>
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
            <p className="text-white">
              Ждём игрока{' '}
              {users.find((user) => user.id === waitingForPlayer)?.name ?? waitingForPlayer}...
            </p>
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Список пользователей */}
      {users.map((user) => {
        const status = statuses[user.id] ?? 'offline';
        const isCurrent = user.id === currentUser?.id;
        const displayStatus =
          currentUser?.id === user.id && (!status || status === 'offline') ? 'online' : status;
        return (
          <div
            key={user.id}
            className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-800 rounded-xl p-4 shadow-md transition group overflow-hidden"
          >
            <span className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/30 via-white/20 to-purple-500/30 opacity-0 blur-2xl group-hover:opacity-100 group-hover:animate-[shine_2s_linear_infinite] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 ">
                {isCurrent && editingName ? (
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    autoFocus
                    className="bg-slate-700 px-2 py-1 rounded text-sm outline-none text-xl"
                  />
                ) : (
                  <p className="text-lg font-semibold">{user.name}</p>
                )}

                {isCurrent && !editingName && (
                  <button
                    onClick={() => {
                      setTempName(user.name);
                      setEditingName(true);
                    }}
                    className="text-slate-400 hover:text-white transition cursor-pointer"
                    title="Редактировать имя"
                  >
                    🛠️
                  </button>
                )}
              </div>

              <p className={clsx('text-sm', statusStyles[displayStatus])}>
                <span
                  className={clsx(
                    'relative px-3 py-0.5 rounded-full text-xs font-medium inline-block',
                    {
                      'bg-green-500/20 text-green-300': displayStatus === 'online',
                      'bg-yellow-500/20 text-yellow-300': displayStatus === 'in-game',
                      'bg-gray-500/20 text-gray-400': displayStatus === 'offline',
                    },
                  )}
                >
                  {displayStatus}
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
