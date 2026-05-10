import type { IterationSnapshot } from '../../solver/types';
import { TransportTable } from './TransportTable';
import { IterationControls } from './IterationControls';

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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (iterations.length === 0) return null;

  const snapshot = iterations[currentStep];
  if (!snapshot) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6 border border-gray-200 space-y-4">
      <h2 className="text-lg font-semibold text-slate-700">Wyniki</h2>

      <IterationControls
        currentStep={currentStep}
        totalSteps={iterations.length}
        onPrev={() => onStepChange(currentStep - 1)}
        onNext={() => onStepChange(currentStep + 1)}
      />

      <div
        className={`text-center text-sm px-4 py-2 rounded-lg ${
          snapshot.isOptimal
            ? 'bg-green-50 text-green-700 border border-green-200'
            : snapshot.isInitialPhase
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <span className="font-medium">
          {snapshot.isInitialPhase ? 'Faza początkowa' : 'Optymalizacja'}
          {snapshot.isOptimal && ' — Rozwiązanie optymalne!'}
        </span>
        <span className="mx-2">·</span>
        {snapshot.description}
      </div>

      <TransportTable snapshot={snapshot} />

      <div className="flex justify-center gap-6 text-sm">
        <div className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
          <span className="text-slate-500">Zysk całkowity:</span>{' '}
          <span className="font-bold text-slate-800">
            {snapshot.totalProfit.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 ring-2 ring-green-500 inline-block" />
          Wybrany max
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-50 border border-blue-300 inline-block" />
          Bazowa
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-50 ring-2 ring-amber-500 inline-block" />
          Cykl
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" />
          Zablokowana
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300 inline-block italic text-[8px] leading-none flex items-center justify-center">
            F
          </span>
          Fikcyjna
        </span>
      </div>
    </div>
  );
}
