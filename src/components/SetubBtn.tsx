type SetubBtnProps = {
  clearBoard: () => void;
  startGame: () => void;
  isDisable: boolean;
};

const SetubBtn = ({ startGame, isDisable, clearBoard }: SetubBtnProps) => {
  return (
    <div className="mt-4 gap-2 flex items-center ">
      <button
        onClick={clearBoard}
        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer transition-all hover:scale-105 active:scale-95"
      >
        Очистить поле
      </button>
      <button
        disabled={isDisable}
        onClick={startGame}
        className={`
    relative px-4 py-2 rounded-lg  font-medium
    transition-all active:scale-95 hover:scale-105
    ${
      isDisable
        ? 'bg-slate-600 cursor-not-allowed opacity-50'
        : 'bg-blue-700 hover:bg-blue-500 cursor-pointer'
    }
  `}
      >
        {!isDisable && (
          <span
            className="
        absolute -inset-2 rounded-xl
        bg-gradient-to-r from-transparent via-white/40 to-transparent
        blur-md
        animate-ping
        pointer-events-none
      "
          />
        )}

        <span className="relative z-10">Начать игру</span>
      </button>
    </div>
  );
};

export default SetubBtn;
