interface IterationControlsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

export function IterationControls({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
}: IterationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onPrev}
        disabled={currentStep <= 0}
        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium
          hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ◀ Wstecz
      </button>
      <span className="text-sm font-medium text-slate-600 min-w-[120px] text-center">
        Iteracja {currentStep + 1} / {totalSteps}
      </span>
      <button
        onClick={onNext}
        disabled={currentStep >= totalSteps - 1}
        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium
          hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Dalej ▶
      </button>
    </div>
  );
}
