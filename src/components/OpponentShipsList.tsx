import type { Ship } from '../types/models';
import React from 'react';

export interface OpponentShipsListProps {
  ships: Ship[];
}

const OpponentShipsList: React.FC<OpponentShipsListProps> = ({ ships }) => {
  return (
    <div className="flex flex-col gap-2">
      {ships.map((ship) => (
        <div
          key={ship.id}
          className={`h-8 bg-gray-600 text-white font-medium rounded-md flex items-center justify-center`}
          style={{ width: `${ship.size * 32}px` }}
        >
          {ship.name}
        </div>
      ))}
    </div>
  );
};

export default OpponentShipsList;
