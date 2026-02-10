import { useGameStore } from '../../store/fightStore';
import BattleBoardCell from '../../components/BattleBoardCell';
import type { BoardCell } from '../../types/models';
import { useNavigate, useParams } from 'react-router-dom';
import BoardEffectsLayer from '../../components/BoardEffectsLayer';
import { useBattleSocket } from '../../hooks/useBattleSocket';

const BOARD_SIZE = 10;

const FightPage = () => {
  const { playerBoard, enemyBoard, phase, isPlayerTurn, winner } = useGameStore();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  const { shoot } = useBattleSocket(gameId);

  const handleEnemyCellClick = (cell: BoardCell) => {
    if (phase !== 'battle') return;
    if (!isPlayerTurn) return;
    if (cell.isHit || cell.missed) return;
    shoot(cell.x, cell.y);
  };

  const finishFight = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Бой ⚔️</h1>

      <div className="flex w-full gap-8 justify-center max-w-screen">
        {/* Поле игрока */}
        <div className="relative flex flex-col items-center">
          <h2 className="mb-2">Твоё поле</h2>

          <BoardEffectsLayer board={playerBoard} />

          <div
            className="bg-slate-800 shadow-xl"
            style={{
              width: '400px',
              height: '400px',
              display: 'grid',
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {playerBoard.flat().map((cell) => (
              <BattleBoardCell key={`${cell.x}-${cell.y}`} cell={cell} />
            ))}
          </div>
        </div>

        {/* Поле противника */}
        <div className="relative flex flex-col items-center">
          <h2 className="mb-2">Поле противника</h2>

          <BoardEffectsLayer board={enemyBoard} />

          <div
            className="bg-slate-800 shadow-xl"
            style={{
              width: '400px',
              height: '400px',
              display: 'grid',
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {enemyBoard.flat().map((cell) => (
              <BattleBoardCell
                key={`${cell.x}-${cell.y}`}
                cell={cell}
                isOpponent
                onClick={handleEnemyCellClick}
                disabled={!isPlayerTurn || phase !== 'battle'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Заглушка ожидания хода */}
      {!isPlayerTurn && phase === 'battle' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-2xl animate-pulse pointer-events-none">Противник думает…</div>
        </div>
      )}

      {/* Конец игры (если сервер перевёл фазу) */}
      {phase === 'finished' && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <h2 className="text-4xl font-bold mb-4">
            {winner === 'player' ? '🎉 Победа!' : '💀 Поражение!'}
          </h2>
          <button
            onClick={finishFight}
            className="px-6 py-2 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 transition"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default FightPage;
