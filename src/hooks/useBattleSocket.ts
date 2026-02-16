import type { BoardCell, ChatMessage } from '../types/models';
import { io, type Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/fightStore';
import { useUserStore } from '../store/userStore';

export const useBattleSocket = (gameId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  const { currentUser } = useUserStore();
  const { setEnemyBoard, setPersonBoard, setPhase, setIsPlayerTurn, applyMoveResult, setTurn } =
    useGameStore();

  useEffect(() => {
    if (!gameId || !currentUser) return;
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { userId: currentUser.id },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    /** ▶ старт боя */
    socket.on('battle_start', (data) => {
      setEnemyBoard(data.enemyBoard);
      setIsPlayerTurn(data.myTurn);
      setPhase('battle');
    });

    /** ▶ результат хода */
    socket.on('shot_result', (data) => {
      applyMoveResult(data.x, data.y, data.hit, data.shooter, currentUser.id);

      if (!data.hit) {
        setTurn(data.nextTurn, currentUser.id);
      }
    });

    /** ▶ чат от сервера */
    socket.on('battle_chat', (msg: ChatMessage) => {
      console.log('msg', msg);
      useGameStore.getState().addChatMessage(msg);
    });

    /** ▶ конец игры */
    socket.on('game_finished', (data: { winnerId: number }) => {
      const isWinner = data.winnerId === currentUser.id;
      useGameStore.setState({
        phase: 'finished',
        winner: isWinner ? 'player' : 'enemy',
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId, currentUser]);

  /** ▶ выстрел */
  const shoot = (x: number, y: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('shoot', {
      gameId: gameId?.replace(/^:/, ''),
      x,
      y,
    });
  };

  /** ▶ готовность */
  const ready = (board: BoardCell[][]) => {
    if (!socketRef.current) return;
    setPersonBoard(board);
    socketRef.current.emit('player_ready', { gameId, board });
  };

  /** ▶ отправка чата */
  const sendChat = (message: string) => {
    if (!socketRef.current || !currentUser) return;

    const cleanGameId = gameId?.replace(/^:/, '');

    socketRef.current.emit('battle_chat', {
      gameId: cleanGameId,
      message,
    });
  };

  return { shoot, ready, sendChat };
};
