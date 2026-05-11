import type { IterationSnapshot } from "../../solver/types";
import { TransportTable } from "./TransportTable";
import { IterationControls } from "./IterationControls";

interface ResultsViewerProps {
  iterations: IterationSnapshot[];
  currentStep: number;
  onStepChange: (step: number) => void;
  error: string | null;
}

export function ResultsViewer({
  iterations,
  currentStep,
  onStepChange,
  error,
}: ResultsViewerProps) {
  if (error) {
    return (
      <section className="px-16 py-6">
        <div className="border-t-2 border-black pt-6">
          <p className="text-[18px] text-black/60">{error}</p>
        </div>
      </section>
    );
  }

  if (iterations.length === 0) return null;

  const snapshot = iterations[currentStep];
  if (!snapshot) return null;

  return (
    <section className="px-16 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[24px] font-medium">Wyniki</h2>
        <div className="flex items-center gap-6 text-[14px] text-black/50">
          <span>
            {snapshot.isInitialPhase ? "Faza początkowa" : "Optymalizacja"}
            {snapshot.isOptimal && " - Rozwiązanie optymalne"}
          </span>
          <span className="font-medium text-black text-[18px]">
            Zysk: <strong>{snapshot.totalProfit.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      <IterationControls
        currentStep={currentStep}
        totalSteps={iterations.length}
        onPrev={() => onStepChange(currentStep - 1)}
        onNext={() => onStepChange(currentStep + 1)}
      />

      {snapshot.description && (
        <p className="text-[14px] text-black/50 mb-4">{snapshot.description}</p>
      )}

      <TransportTable snapshot={snapshot} />

      <div className="flex flex-wrap gap-6 mt-6 text-[13px] text-black/40">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F2F2F2] outline outline-2 outline-black outline-offset-[-2px] inline-block" />
          Wybrany max
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F2F2F2] inline-block" />
          Bazowa
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F2F2F2] outline outline-2 outline-black outline-offset-[-2px] outline-dashed inline-block" />
          Cykl
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F2F2F2] inline-block opacity-60" />
          Zablokowana
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[13px] italic text-black/40">FD / FO</span>
          Fikcyjna
        </span>
      </div>
    </section>
  );
}
