import type { BoardCell, Ship } from '../types/models.ts';

const getShipNameBySize = (size: number) => {
  switch (size) {
    case 1:
      return 'Катер';
    case 2:
      return 'Фрегат';
    case 3:
      return 'Эсминец';
    case 4:
      return 'Флагман';
    default:
      return `Корабль ${size}х1`;
  }
};
export const initialShips: Ship[] = [
  { id: 's1', size: 4 },
  { id: 's2', size: 3 },
  { id: 's3', size: 3 },
  { id: 's4', size: 2 },
  { id: 's5', size: 2 },
  { id: 's6', size: 2 },
  { id: 's7', size: 1 },
  { id: 's8', size: 1 },
  { id: 's9', size: 1 },
  { id: 's10', size: 1 },
].map((ship) => ({
  ...ship,
  name: getShipNameBySize(ship.size),
  placed: false,
  orientation: 'horizontal',
  hits: 0,
}));
export const isShipSunk = (board: BoardCell[][], shipId: string) => {
  for (const row of board) {
    for (const cell of row) {
      if (cell.ship?.id === shipId && !cell.isHit) return false;
    }
  }
  return true;
};
export const markSurroundingCells = (board: BoardCell[][], shipId: string) => {
  const newBoard = board.map((row) => row.map((c) => ({ ...c })));
  const BOARD_SIZE = board.length;

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = newBoard[y][x];
      if (cell.ship?.id === shipId) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              !newBoard[ny][nx].hasShip &&
              !newBoard[ny][nx].missed
            ) {
              newBoard[ny][nx].missed = true;
            }
          }
        }
      }
    }
  }

  return newBoard;
};
export const hasAliveShips = (board: BoardCell[][]) =>
  board.some((row) => row.some((cell) => cell.hasShip && !cell.isHit));
