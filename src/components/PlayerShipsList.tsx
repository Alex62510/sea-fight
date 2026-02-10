import React from 'react';
import { useDrag } from 'react-dnd';
import type { GamePhase, Ship } from '../types/models';

export interface PlayerShipsListProps {
  ships: Ship[];
  phase: 'setup' | 'battle';
  owner?: 'me';
  toggleOrientation?: (shipId: string) => void;
}

// отдельный компонент для одного корабля
const ShipItem: React.FC<{
  ship: Ship;
  phase: GamePhase;
  toggleOrientation?: (shipId: string) => void;
}> = ({ ship, phase, toggleOrientation }) => {
  const [{ isDragging }, drag] = useDrag<Ship, unknown, { isDragging: boolean }>({
    type: 'SHIP',
    item: ship,
    canDrag: phase === 'setup' && !ship.placed,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      className="flex items-center gap-2 select-none cursor-pointer"
      onDoubleClick={() => toggleOrientation?.(ship.id)}
      style={{
        flexDirection: 'row',
        opacity: ship.placed ? 0.5 : 1,
      }}
    >
      {/* Имя корабля */}
      <span className="text-white font-medium w-24">{ship.name}</span>

      {/* Перетаскиваемый блок клеток */}
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className="flex"
        style={{
          flexDirection: ship.orientation === 'horizontal' ? 'row' : 'column',
          gap: '2px',
          opacity: isDragging ? 0.7 : 1,
        }}
      >
        {Array.from({ length: ship.size }).map((_, i) => (
          <div key={i} className="w-6 h-6 bg-blue-500 rounded-sm border border-slate-200" />
        ))}
      </div>
    </div>
  );
};

const PlayerShipsList: React.FC<PlayerShipsListProps> = ({ ships, phase, toggleOrientation }) => {
  return (
    <div className="flex flex-col gap-3">
      {ships.map((ship) => (
        <ShipItem key={ship.id} ship={ship} phase={phase} toggleOrientation={toggleOrientation} />
      ))}
    </div>
  );
};

export default PlayerShipsList;
export type { Ship };
