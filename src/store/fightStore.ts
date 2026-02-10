import { create } from 'zustand';
import type { BoardCell, Ship } from '../types/models';
import { initialShips, isShipSunk, markSurroundingCells } from '../utils/sheep';

interface GameStore {
  playerBoard: BoardCell[][];
  enemyBoard: BoardCell[][];
  playerShips: Ship[];
  enemyShips: Ship[];
  phase: 'setup' | 'waiting' | 'battle' | 'finished';
  winner: 'player' | 'enemy' | null;
  currentTurnUserId: number | null;
  isPlayerTurn: boolean;
  setPersonBoard: (board: BoardCell[][]) => void;
  setEnemyBoard: (updater: BoardCell[][] | ((prev: BoardCell[][]) => BoardCell[][])) => void;
  setPlayerShips: (ships: Ship[]) => void;
  setEnemyShips: (ships: Ship[]) => void;
  setPhase: (phase: GameStore['phase']) => void;
  setTurn: (userId: number, myId: number) => void;
  applyEnemyMove: (x: number, y: number) => void;
  setIsPlayerTurn: (value: boolean) => void;
  applyMoveResult: (x: number, y: number, hit: boolean, shooterId: number, myId: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerBoard: [],
  enemyBoard: [],
  playerShips: initialShips,
  enemyShips: initialShips.map((s) => ({ ...s, placed: false })),
  phase: 'setup',
  winner: null,
  currentTurnUserId: null,
  isPlayerTurn: true,

  setPersonBoard: (board) => set({ playerBoard: board }),

  setEnemyBoard: (updater) =>
    set((state) => ({
      enemyBoard: typeof updater === 'function' ? updater(state.enemyBoard) : updater,
    })),
  setIsPlayerTurn: (value) => set({ isPlayerTurn: value }),
  setPlayerShips: (ships) => set({ playerShips: ships }),
  setEnemyShips: (ships) => set({ enemyShips: ships }),
  setPhase: (phase) => set({ phase }),
  setTurn: (turnUserId, myId) =>
    set({
      currentTurnUserId: turnUserId,
      isPlayerTurn: turnUserId === myId,
    }),
  applyMoveResult: (x, y, hit, shooterId, myId) =>
    set((state) => {
      const isMe = shooterId === myId;
      const boardToUpdate = isMe ? state.enemyBoard : state.playerBoard;

      // Обновляем клетку
      let newBoard = boardToUpdate.map((row) =>
        row.map((cell) =>
          cell.x === x && cell.y === y
            ? hit
              ? { ...cell, isHit: true }
              : { ...cell, missed: true }
            : cell,
        ),
      );

      // Если попал и корабль уничтожен, отмечаем промахи вокруг
      if (hit) {
        const hitCell = boardToUpdate[y][x];
        if (hitCell.ship && isShipSunk(newBoard, hitCell.ship.id)) {
          newBoard = markSurroundingCells(newBoard, hitCell.ship.id);
        }
      }

      return {
        ...(isMe ? { enemyBoard: newBoard } : { playerBoard: newBoard }),
        // Если промах — ход переходит другому игроку, иначе остаётся
        isPlayerTurn: hit ? isMe : !isMe,
      };
    }),

  /** 🔥 ВОТ ОН */
  applyEnemyMove: (x, y) =>
    set((state) => ({
      enemyBoard: state.enemyBoard.map((row) =>
        row.map((cell) => (cell.x === x && cell.y === y ? { ...cell, isHit: true } : cell)),
      ),
    })),
}));
