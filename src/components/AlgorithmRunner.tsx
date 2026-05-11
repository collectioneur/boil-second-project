interface AlgorithmRunnerProps {
  onSolve: () => void;
  disabled?: boolean;
}

export function AlgorithmRunner({ onSolve, disabled }: AlgorithmRunnerProps) {
  return (
    <section className="px-16 py-6">
      <button
        onClick={onSolve}
        disabled={disabled}
        className="w-full bg-black text-white text-[18px] font-medium py-5
          hover:bg-[#222] active:bg-[#444] transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderRadius: 0 }}
      >
        Oblicz
      </button>
    </section>
  );
}
