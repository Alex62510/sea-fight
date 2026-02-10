import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import PlayerShipsList, { type Ship } from '../../components/PlayerShipsList';
import BoardCellComponent from '../../components/BoardCellComponent';
import type { BoardCell } from '../../types/models';
import { initialShips } from '../../utils/sheep.ts';
import Waiting from '../../components/Waiting.tsx';
import SetubBtn from '../../components/SetubBtn.tsx';
import { useGameStore } from '../../store/fightStore.ts';
import { useBattleSocket } from '../../hooks/useBattleSocket.ts';
import { useUserStore } from '../../store/userStore.ts';

const BOARD_SIZE = 10;

const createEmptyBoard = (size = BOARD_SIZE): BoardCell[][] =>
  Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => ({
      x,
      y,
      ship: undefined,
      hasShip: false,
      isHit: false,
      blocked: false,
    })),
  );

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { phase, setPhase, isPlayerTurn } = useGameStore();
  const { currentUser } = useUserStore();
  const [playerShips, setPlayerShips] = useState<Ship[]>(initialShips);
  const [playerBoard, setPlayerBoard] = useState<BoardCell[][]>(createEmptyBoard());
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [dragShip, setDragShip] = useState<Ship | null>(null);
  const navigate = useNavigate();

  const { ready } = useBattleSocket(gameId, currentUser?.id ?? null);

  // Поворот корабля
  const toggleOrientation = (shipId: string) => {
    setPlayerShips((prev) =>
      prev.map((s) =>
        s.id === shipId
          ? { ...s, orientation: s.orientation === 'horizontal' ? 'vertical' : 'horizontal' }
          : s,
      ),
    );
  };

  // Расстановка корабля
  const moveShipToBoard = (ship: Ship, x: number, y: number) => {
    if (
      (ship.orientation === 'horizontal' && x + ship.size > BOARD_SIZE) ||
      (ship.orientation === 'vertical' && y + ship.size > BOARD_SIZE)
    )
      return;
    for (let i = 0; i < ship.size; i++) {
      const dx = ship.orientation === 'horizontal' ? i : 0;
      const dy = ship.orientation === 'vertical' ? i : 0;
      const cell = playerBoard[y + dy][x + dx];
      if (cell.hasShip || cell.blocked) return;
    }

    setPlayerShips((prev) => prev.map((s) => (s.id === ship.id ? { ...s, placed: true } : s)));

    setPlayerBoard((prev) => {
      const newBoard = prev.map((row) => row.map((cell) => ({ ...cell })));

      for (let i = 0; i < ship.size; i++) {
        const dx = ship.orientation === 'horizontal' ? i : 0;
        const dy = ship.orientation === 'vertical' ? i : 0;
        newBoard[y + dy][x + dx] = { ...newBoard[y + dy][x + dx], ship, hasShip: true };
      }

      // блокируем соседние клетки
      for (let i = 0; i < ship.size; i++) {
        const shipX = x + (ship.orientation === 'horizontal' ? i : 0);
        const shipY = y + (ship.orientation === 'vertical' ? i : 0);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const bx = shipX + dx;
            const by = shipY + dy;

            if (
              bx >= 0 &&
              bx < BOARD_SIZE &&
              by >= 0 &&
              by < BOARD_SIZE &&
              !newBoard[by][bx].hasShip
            ) {
              newBoard[by][bx].blocked = true;
            }
          }
        }
      }

      return newBoard;
    });
  };

  const isDisable = useMemo(() => {
    return !playerShips.every((s) => s.placed);
  }, [playerShips]);

  const startGame = () => {
    if (!playerShips.every((s) => s.placed)) return;

    ready(playerBoard);
    setPhase('waiting');
  };

  const finishGame = () => {
    navigate('/');
  };

  const clearBoard = () => {
    setPlayerBoard(createEmptyBoard());
    setPlayerShips((prev) => prev.map((s) => ({ ...s, placed: false })));
  };

  useEffect(() => {
    if (phase === 'battle') {
      navigate(`/fight/:${gameId}`);
    }
  }, [phase]);

  useEffect(() => {
    const timer = setTimeout(() => clearBoard(), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 space-y-6">
        <div className="flex gap-3">
          <h1 className="text-3xl font-bold mb-4">Игра #{gameId}</h1>
          <button
            onClick={finishGame}
            className="px-4 py-1 my-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition-all animate-pulse hover:scale-105 active:scale-95"
          >
            Покинуть бой
          </button>
        </div>

        <div className="flex w-full max-w-6xl gap-6">
          <PlayerShipsList
            ships={playerShips}
            phase="setup"
            toggleOrientation={toggleOrientation}
          />

          <div className="flex justify-center w-1/2">
            <div
              className="bg-slate-800 shadow-xl"
              style={{
                width: '400px',
                height: '400px',
                display: 'grid',
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                borderTop: '2px solid #94a3b8',
                borderLeft: '2px solid #94a3b8',
              }}
            >
              {playerBoard.flat().map((cell) => (
                <div
                  key={`${cell.x}-${cell.y}`}
                  style={{
                    borderRight:
                      cell.x === BOARD_SIZE - 1 ? '2px solid #94a3b8' : '1px solid #94a3b8',
                    borderBottom:
                      cell.y === BOARD_SIZE - 1 ? '2px solid #94a3b8' : '1px solid #94a3b8',
                  }}
                >
                  <BoardCellComponent
                    cell={cell}
                    onDropShip={moveShipToBoard}
                    hoverCell={hoverCell}
                    draggedShip={dragShip}
                    setHoverCell={setHoverCell}
                    setDragShip={setDragShip}
                    disabled={!isPlayerTurn}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {phase === 'waiting' && <Waiting />}
        <SetubBtn startGame={startGame} isDisable={isDisable} clearBoard={clearBoard} />
      </div>
    </DndProvider>
  );
};

export default GamePage;
