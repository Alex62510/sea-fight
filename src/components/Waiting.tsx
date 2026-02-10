const Waiting = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* затемнение */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

      {/* контент */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Заголовок */}
        <h2 className="text-3xl font-bold tracking-wide">Ожидание противника</h2>

        {/* Анимированная линия (как в AAA лобби) */}
        <div className="relative w-64 h-1 overflow-hidden rounded-full bg-white/10">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[loading_2s_linear_infinite]" />
        </div>

        {/* Якорь / иконка */}
        <div className="text-5xl animate-bounce">⚓</div>

        {/* Подпись */}
        <p className="text-white/60 text-sm max-w-xs">
          Противник расставляет корабли.
          <br />
          Подготовься к бою.
        </p>
      </div>
    </div>
  );
};

export default Waiting;
