import { useGameStore } from '../../store/fightStore';
import BattleBoardCell from '../../components/BattleBoardCell';
import type { BoardCell } from '../../types/models';
import { useNavigate, useParams } from 'react-router-dom';
import { useBattleSocket } from '../../hooks/useBattleSocket';
import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../../store/userStore.ts';

const BOARD_SIZE = 10;

const FightPage = () => {
  const { playerBoard, enemyBoard, phase, isPlayerTurn, winner, chat } = useGameStore();
  const { currentUser } = useUserStore();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { shoot, sendChat } = useBattleSocket(gameId);

  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleEnemyCellClick = (cell: BoardCell) => {
    if (phase !== 'battle') return;
    if (!isPlayerTurn) return;
    if (cell.isHit || cell.missed) return;
    shoot(cell.x, cell.y);
  };

  const finishFight = () => {
    navigate('/');
  };

  /** Прокрутка чата вниз при новых сообщениях */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Бой ⚔️</h1>

      {/* Поля игроков */}
      <div className="flex flex-col sm:flex-row w-full gap-1 justify-center  max-w-screen">
        {/* Поле игрока */}
        <div className="flex flex-col items-center w-full">
          <h2 className="mb-2">Твоё поле</h2>
          <div
            className="bg-slate-800 shadow-xl"
            style={{
              width: '100%',
              maxWidth: '400px',
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
        <div className="flex flex-col items-center w-full">
          <h2 className="mb-2">Поле противника</h2>
          <div
            className="bg-slate-800 shadow-xl"
            style={{
              width: '100%',
              maxWidth: '400px',
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

      {/* Чат всегда снизу */}
      <div className="w-full max-w-screen flex flex-col space-y-2 mt-4">
        <h2 className="text-xl font-semibold">Чат</h2>
        <div className="bg-slate-800 rounded-lg p-2 h-64 overflow-y-auto flex flex-col space-y-1">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`inline-block px-2 py-1 rounded-lg ${
                msg.senderId === currentUser?.id
                  ? 'bg-green-700 text-white text-right'
                  : 'bg-red-300 text-black text-left'
              }`}
              style={{
                alignSelf: msg.senderId === currentUser?.id ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.message}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-1 rounded-lg bg-slate-700 text-white"
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
          />
          <button
            className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
            onClick={handleSendMessage}
          >
            Отправить
          </button>
        </div>
      </div>

      {/* Заглушка ожидания хода */}
      {!isPlayerTurn && phase === 'battle' && (
        <div
          className="absolute top-0 left-0 right-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none"
          style={{ height: '560px' }} // ограничиваем область только под полями
        >
          <div className="text-2xl animate-pulse pointer-events-none">Противник думает…</div>
        </div>
      )}

      {/* Конец игры */}
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
