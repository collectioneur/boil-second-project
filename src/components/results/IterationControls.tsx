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
    <div className="flex items-center justify-between border-b border-black pb-4 mb-6">
      <button
        onClick={onPrev}
        disabled={currentStep <= 0}
        className="text-[18px] font-medium hover:opacity-50 transition-opacity
          disabled:opacity-20 disabled:cursor-not-allowed"
      >
        ← Wstecz
      </button>
      <span className="text-[18px] font-medium">
        Iteracja {currentStep + 1} / {totalSteps}
      </span>
      <button
        onClick={onNext}
        disabled={currentStep >= totalSteps - 1}
        className="text-[18px] font-medium hover:opacity-50 transition-opacity
          disabled:opacity-20 disabled:cursor-not-allowed"
      >
        Dalej →
      </button>
    </div>
  );
}
