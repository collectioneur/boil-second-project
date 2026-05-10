import { useState, useCallback } from 'react';
import type { Supplier, Receiver, IterationSnapshot } from './solver/types';
import { solve } from './solver/solver';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { DataInputForm } from './components/DataInputForm';
import { AlgorithmRunner } from './components/AlgorithmRunner';
import { ResultsViewer } from './components/results/ResultsViewer';

function createSuppliers(count: number, existing: Supplier[]): Supplier[] {
  return Array.from({ length: count }, (_, i) =>
    existing[i] ?? { id: i, podaz: 10, kosztZakupu: 5 }
  );
}

function createReceivers(count: number, existing: Receiver[]): Receiver[] {
  return Array.from({ length: count }, (_, i) =>
    existing[i] ?? { id: i, popyt: 10, cenaSprzedazy: 15 }
  );
}

function resize2D<T>(arr: T[][], rows: number, cols: number, fill: T): T[][] {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => arr[i]?.[j] ?? fill)
  );
}

const Divider = () => <div className="border-t border-black mx-16" />;

export default function App() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(3);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => createSuppliers(3, []));
  const [receivers, setReceivers] = useState<Receiver[]>(() => createReceivers(3, []));
  const [transportCosts, setTransportCosts] = useState<number[][]>(() =>
    resize2D([], 3, 3, 2)
  );
  const [blockedRoutes, setBlockedRoutes] = useState<boolean[][]>(() =>
    resize2D([], 3, 3, false)
  );
  const [iterations, setIterations] = useState<IterationSnapshot[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleChangeM = useCallback(
    (val: number) => {
      setM(val);
      setSuppliers((prev) => createSuppliers(val, prev));
      setTransportCosts((prev) => resize2D(prev, val, n, 2));
      setBlockedRoutes((prev) => resize2D(prev, val, n, false));
      setIterations([]);
      setError(null);
    },
    [n]
  );

  const handleChangeN = useCallback(
    (val: number) => {
      setN(val);
      setReceivers((prev) => createReceivers(val, prev));
      setTransportCosts((prev) => resize2D(prev, m, val, 2));
      setBlockedRoutes((prev) => resize2D(prev, m, val, false));
      setIterations([]);
      setError(null);
    },
    [m]
  );

  const handleSupplierChange = useCallback(
    (index: number, field: 'podaz' | 'kosztZakupu', value: number) => {
      setSuppliers((prev) =>
        prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
      );
    },
    []
  );

  const handleReceiverChange = useCallback(
    (index: number, field: 'popyt' | 'cenaSprzedazy', value: number) => {
      setReceivers((prev) =>
        prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const handleTransportCostChange = useCallback(
    (i: number, j: number, value: number) => {
      setTransportCosts((prev) => {
        const next = prev.map((row) => [...row]);
        next[i][j] = value;
        return next;
      });
    },
    []
  );

  const handleToggleBlock = useCallback((i: number, j: number) => {
    setBlockedRoutes((prev) => {
      const next = prev.map((row) => [...row]);
      next[i][j] = !next[i][j];
      return next;
    });
  }, []);

  const handleSolve = useCallback(() => {
    const result = solve({
      m,
      n,
      suppliers: suppliers.slice(0, m),
      receivers: receivers.slice(0, n),
      transportCosts: transportCosts.slice(0, m).map((row) => row.slice(0, n)),
      blockedRoutes: blockedRoutes.slice(0, m).map((row) => row.slice(0, n)),
    });
    setIterations(result.iterations);
    setCurrentStep(0);
    setError(result.error);
  }, [m, n, suppliers, receivers, transportCosts, blockedRoutes]);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <Divider />
      <ConfigPanel m={m} n={n} onChangeM={handleChangeM} onChangeN={handleChangeN} />
      <Divider />
      <DataInputForm
        m={m}
        n={n}
        suppliers={suppliers}
        receivers={receivers}
        transportCosts={transportCosts}
        blockedRoutes={blockedRoutes}
        onSupplierChange={handleSupplierChange}
        onReceiverChange={handleReceiverChange}
        onTransportCostChange={handleTransportCostChange}
        onToggleBlock={handleToggleBlock}
      />
      <Divider />
      <AlgorithmRunner onSolve={handleSolve} />
      {(iterations.length > 0 || error) && (
        <>
          <Divider />
          <ResultsViewer
            iterations={iterations}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            error={error}
          />
        </>
      )}
    </div>
  );
}
