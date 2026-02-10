import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectLobby(userId: number): Socket {
  if (!userId) throw new Error('userId is required');

  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: false,
    });

    socket.on('connect', () => console.log('[Lobby] connected', socket?.id, 'user:', userId));
    socket.on('disconnect', () => console.log('[Lobby] disconnected'));
  }

  return socket;
}

export function disconnectLobby() {
  if (socket) {
    socket.disconnect();
    console.log('[Lobby] disconnectLobby');
    socket = null;
  }
}
export function inviteGame(opponentId: number) {
  if (!socket) return;
  socket.emit('invite_game', opponentId);
}

export function acceptGame(fromUserId: number, myId: number) {
  if (!socket) return;
  socket.emit('accept_game', { from: fromUserId, to: myId });
}

export function onGameInvite(cb: (from: number) => void) {
  const s = getLobbySocket();
  if (!s) return () => {};
  const handler = (payload: { from: number }) => cb(payload.from);
  s.on('game_invite', handler);
  return () => s.off('game_invite', handler);
}

export function onGameStart(cb: (gameId: string) => void) {
  const s = getLobbySocket();
  if (!s) return () => {};
  const handler = (payload: { gameId: string }) => cb(payload.gameId);
  s.on('game_start', handler);
  return () => s.off('game_start', handler);
}

export function onGameAccepted(cb: ({ from, gameId }: { from: number; gameId: string }) => void) {
  const s = socket;
  if (!s) return () => {}; // TS понимает, что дальше s точно не null

  const handler = ({ from, gameId }: { from: number; gameId: string }) => cb({ from, gameId });
  s.on('game_accepted', handler);

  return () => s.off('game_accepted', handler);
}

export function getLobbySocket() {
  return socket;
}
