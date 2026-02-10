import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import {
  connectLobby,
  disconnectLobby,
  onGameInvite,
  onGameStart,
  onGameAccepted,
} from '../services/lobbySocket';

interface Handlers {
  onInvite?: (from: number) => void;
  onStart?: (gameId: string) => void;
  onAccepted?: ({ from, gameId }: { from: number; gameId: string }) => void;
  onBattleStart?: ({ gameId, turn }: { gameId: string; turn: number }) => void;
  onFireResult?: (payload: { x: number; y: number; hit: boolean; shooter: number }) => void;
  onTurnChange?: (turn: number) => void;
}

export const useLobbySocket = (userId: number | null, handlers?: Handlers) => {
  const setStatuses = useUserStore((s) => s.setStatusesRaw);

  useEffect(() => {
    if (!userId) return;

    const socket = connectLobby(userId);

    // Статусы
    socket.on('users_status', (statuses) => setStatuses(statuses));
    socket.on(
      'user_status_update',
      ({ id, status }: { id: number; status: 'online' | 'offline' | 'in-game' }) => {
        useUserStore.getState().setStatus(id, status);
      },
    );
    // Подписки на события
    const unsubscribeInvite = handlers?.onInvite ? onGameInvite(handlers.onInvite) : undefined;
    const unsubscribeStart = handlers?.onStart ? onGameStart(handlers.onStart) : undefined;
    const unsubscribeAccepted = handlers?.onAccepted
      ? onGameAccepted(handlers.onAccepted)
      : undefined;

    const handleBattleStart = handlers?.onBattleStart
      ? (payload: { gameId: string; turn: number }) => handlers.onBattleStart!(payload)
      : undefined;
    if (handleBattleStart) socket.on('battle_start', handleBattleStart);

    const handleFireResult = handlers?.onFireResult
      ? (payload: { x: number; y: number; hit: boolean; shooter: number }) =>
          handlers.onFireResult!(payload)
      : undefined;
    if (handleFireResult) socket.on('fire_result', handleFireResult);

    const handleTurnChange = handlers?.onTurnChange
      ? (payload: { turn: number }) => handlers.onTurnChange!(payload.turn)
      : undefined;
    if (handleTurnChange) socket.on('turn_change', handleTurnChange);

    return () => {
      unsubscribeInvite?.();
      unsubscribeStart?.();
      unsubscribeAccepted?.();
      if (handleBattleStart) socket.off('battle_start', handleBattleStart);
      if (handleFireResult) socket.off('fire_result', handleFireResult);
      if (handleTurnChange) socket.off('turn_change', handleTurnChange);
      disconnectLobby();
    };
  }, [userId]);
};
