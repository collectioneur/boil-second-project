interface AlgorithmRunnerProps {
  onSolve: () => void;
  disabled?: boolean;
}

export function AlgorithmRunner({ onSolve, disabled }: AlgorithmRunnerProps) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onSolve}
        disabled={disabled}
        className="px-8 py-3 rounded-xl bg-slate-800 text-white font-semibold text-lg
          hover:bg-slate-700 active:bg-slate-900 transition-colors shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Oblicz
      </button>
    </div>
  );
}
