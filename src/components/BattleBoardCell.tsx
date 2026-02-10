import React from 'react';
import type { BoardCell } from '../types/models';

interface BattleBoardCellProps {
  cell: BoardCell;
  isOpponent?: boolean;
  onClick?: (cell: BoardCell) => void;
  disabled?: boolean;
}

const BattleBoardCell: React.FC<BattleBoardCellProps> = ({
  cell,
  isOpponent,
  onClick,
  disabled,
}) => {
  const handleClick = () => {
    if (disabled) return;
    if (isOpponent && !cell.isHit && !cell.missed) {
      onClick?.(cell);
    }
  };

  const baseBg = () => {
    if (cell.isHit && cell.hasShip) return 'bg-red-600';
    if (cell.missed) return 'bg-gray-500/50';
    if (!isOpponent && cell.hasShip) return 'bg-blue-600';
    return 'bg-slate-700';
  };

  return (
    <div
      onClick={handleClick}
      className={`
    relative w-full h-full border border-slate-500
    flex items-center justify-center
    transition-colors
    ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    ${baseBg()}
  `}
    >
      {/* 🔴 Аура попадания — НЕ мешает кликам */}
      {cell.isHit && cell.hasShip && (
        <span
          className="
            absolute inset-0
            bg-red-500/70
            animate-ping
            pointer-events-none
          "
        />
      )}

      {/* Основной слой */}
      {cell.isHit && cell.hasShip && (
        <div className="relative z-10 w-2 h-2 rounded-full bg-white" />
      )}
      {cell.missed && <div className="relative z-10 w-2 h-2 rounded-full bg-black" />}
    </div>
  );
};

export default BattleBoardCell;
