import type { BoardCell } from '../types/models';

const CELL_SIZE = 40; // 400 / 10

interface Props {
  board: BoardCell[][];
}

const BoardEffectsLayer = ({ board }: Props) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 top-8"
      style={{ width: '400px', height: '400px' }}
    >
      {board.flat().map(
        (cell) =>
          cell.isHit &&
          cell.hasShip && (
            <span
              key={`fx-${cell.x}-${cell.y}`}
              className="
                absolute rounded-full
                bg-red-500/20
                animate-pulse
              "
              style={{
                width: CELL_SIZE * 2,
                height: CELL_SIZE * 2,
                left: cell.x * CELL_SIZE - CELL_SIZE / 2,
                top: cell.y * CELL_SIZE - CELL_SIZE / 2,
              }}
            />
          ),
      )}
    </div>
  );
};

export default BoardEffectsLayer;
