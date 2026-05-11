export interface Supplier {
  id: number;
  podaz: number;
  kosztZakupu: number;
}

export interface Receiver {
  id: number;
  popyt: number;
  cenaSprzedazy: number;
}

export interface IterationSnapshot {
  step: number;
  description: string;
  profitMatrix: number[][];
  allocation: (number | null)[][];
  remainingSupply: number[];
  remainingDemand: number[];
  alpha: (number | null)[];
  beta: (number | null)[];
  delta: (number | null)[][];
  selectedCell: [number, number] | null;
  cycleNodes: [number, number][];
  cycleSigns: ('+' | '-')[];
  isFictitious: { rows: boolean[]; cols: boolean[] };
  totalProfit: number;
  totalRevenue: number;
  totalPurchaseCost: number;
  totalTransportCost: number;
  isOptimal: boolean;
  isInitialPhase: boolean;
}

export interface ProblemInput {
  m: number;
  n: number;
  suppliers: Supplier[];
  receivers: Receiver[];
  transportCosts: number[][];
  blockedRoutes: boolean[][];
}

export interface SolveResult {
  iterations: IterationSnapshot[];
  error: string | null;
}
