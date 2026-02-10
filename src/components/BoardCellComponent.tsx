import React from 'react';
import { useDrop } from 'react-dnd';
import type { BoardCell, Ship } from '../types/models';

interface BoardCellProps {
  cell: BoardCell;
  onDropShip?: (ship: Ship, x: number, y: number) => void;
  hoverCell?: { x: number; y: number } | null;
  draggedShip?: Ship | null;
  setHoverCell?: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setDragShip?: React.Dispatch<React.SetStateAction<Ship | null>>;
  onShoot?: () => void; // новый проп для стрельбы
  disabled?: boolean; // запрет клика, если не твой ход
}

const BoardCellComponent: React.FC<BoardCellProps> = ({
  cell,
  onDropShip,
  hoverCell,
  draggedShip,
  setHoverCell,
  setDragShip,
  onShoot,
  disabled,
}) => {
  const [, drop] = useDrop<Ship>({
    accept: 'SHIP',
    hover: (ship) => {
      setDragShip?.(ship);
      setHoverCell?.({ x: cell.x, y: cell.y });
    },
    drop: (ship) => {
      onDropShip?.(ship, cell.x, cell.y);
      setHoverCell?.(null);
      setDragShip?.(null);
    },
  });

  // Подсветка под переносимым кораблём
  let highlight = false;
  if (hoverCell && draggedShip) {
    for (let i = 0; i < draggedShip.size; i++) {
      const x = draggedShip.orientation === 'horizontal' ? hoverCell.x + i : hoverCell.x;
      const y = draggedShip.orientation === 'vertical' ? hoverCell.y + i : hoverCell.y;
      if (cell.x === x && cell.y === y) {
        highlight = true;
        break;
      }
    }
  }

  const getBgClass = () => {
    if (cell.hasShip) return 'bg-blue-600';
    if (cell.blocked) return 'bg-red-500/40';
    return 'bg-slate-700';
  };

  return (
    <div
      ref={drop as never}
      className={`
        w-full h-full flex items-center justify-center
        transition-colors
        ${getBgClass()}
        ${highlight ? 'ring-2 ring-blue-400' : ''}
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
      `}
      onClick={() => {
        if (!disabled && onShoot) {
          onShoot(); // вызываем ход по клику
        }
      }}
    />
  );
};

export default BoardCellComponent;
