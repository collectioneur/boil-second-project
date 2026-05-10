import type { ProblemInput, IterationSnapshot, SolveResult } from './types';
import { findCycle } from './cycleDetector';

const BLOCKED = -Infinity;
const MAX_ITERATIONS = 100;

function deepCopy2D<T>(arr: T[][]): T[][] {
  return arr.map((row) => [...row]);
}

function buildProfitMatrix(input: ProblemInput): number[][] {
  const { m, n, suppliers, receivers, transportCosts, blockedRoutes } = input;
  const z: number[][] = [];
  for (let i = 0; i < m; i++) {
    z[i] = [];
    for (let j = 0; j < n; j++) {
      if (blockedRoutes[i][j]) {
        z[i][j] = BLOCKED;
      } else {
        z[i][j] = receivers[j].cenaSprzedazy - suppliers[i].kosztZakupu - transportCosts[i][j];
      }
    }
  }
  return z;
}

interface BalancedProblem {
  profitMatrix: number[][];
  supply: number[];
  demand: number[];
  rows: number;
  cols: number;
  fictitiousRows: boolean[];
  fictitiousCols: boolean[];
}

function balance(profitMatrix: number[][], supply: number[], demand: number[]): BalancedProblem {
  const totalSupply = supply.reduce((a, b) => a + b, 0);
  const totalDemand = demand.reduce((a, b) => a + b, 0);

  const z = deepCopy2D(profitMatrix);
  const s = [...supply];
  const d = [...demand];
  const fictitiousRows = s.map(() => false);
  const fictitiousCols = d.map(() => false);

  if (totalSupply < totalDemand) {
    // Add fictitious supplier (FD)
    const newRow = new Array(d.length).fill(0);
    z.push(newRow);
    s.push(totalDemand - totalSupply);
    fictitiousRows.push(true);
  } else if (totalSupply > totalDemand) {
    // Add fictitious receiver (FO)
    for (const row of z) {
      row.push(0);
    }
    d.push(totalSupply - totalDemand);
    fictitiousCols.push(true);
  }

  return {
    profitMatrix: z,
    supply: s,
    demand: d,
    rows: s.length,
    cols: d.length,
    fictitiousRows,
    fictitiousCols,
  };
}

function maximumElementMethod(bp: BalancedProblem): {
  allocation: (number | null)[][];
  steps: IterationSnapshot[];
} {
  const { profitMatrix, rows, cols } = bp;
  const remainingSupply = [...bp.supply];
  const remainingDemand = [...bp.demand];
  const allocation: (number | null)[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(null)
  );
  const steps: IterationSnapshot[] = [];
  let stepCount = 0;

  const eliminated = {
    rows: new Array(rows).fill(false) as boolean[],
    cols: new Array(cols).fill(false) as boolean[],
  };

  while (true) {
    let maxVal = -Infinity;
    let maxCell: [number, number] | null = null;

    for (let i = 0; i < rows; i++) {
      if (eliminated.rows[i]) continue;
      for (let j = 0; j < cols; j++) {
        if (eliminated.cols[j]) continue;
        if (profitMatrix[i][j] === BLOCKED) continue;
        if (profitMatrix[i][j] > maxVal) {
          maxVal = profitMatrix[i][j];
          maxCell = [i, j];
        }
      }
    }

    if (!maxCell) break;

    const [r, c] = maxCell;
    const qty = Math.min(remainingSupply[r], remainingDemand[c]);
    allocation[r][c] = qty;
    remainingSupply[r] -= qty;
    remainingDemand[c] -= qty;

    if (remainingSupply[r] === 0) eliminated.rows[r] = true;
    if (remainingDemand[c] === 0) eliminated.cols[c] = true;

    // If both hit 0, keep one alive to avoid losing a basis variable
    if (remainingSupply[r] === 0 && remainingDemand[c] === 0) {
      // Only eliminate one — prefer eliminating the row
      eliminated.cols[c] = false;
      // The column stays for potential 0-allocation in next step
    }

    steps.push(makeSnapshot({
      step: stepCount++,
      description: `Wybrano max z = ${maxVal} w komórce [${r + 1}, ${c + 1}], przydzielono ${qty}`,
      profitMatrix: bp.profitMatrix,
      allocation,
      remainingSupply: [...remainingSupply],
      remainingDemand: [...remainingDemand],
      selectedCell: maxCell,
      bp,
      isInitialPhase: true,
    }));

    const allRowsDone = eliminated.rows.every((e) => e);
    const allColsDone = eliminated.cols.every((e) => e);
    if (allRowsDone || allColsDone) break;
  }

  return { allocation, steps };
}

function handleDegeneracy(
  allocation: (number | null)[][],
  rows: number,
  cols: number
): void {
  const requiredBasic = rows + cols - 1;
  let basicCount = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (allocation[i][j] !== null) basicCount++;
    }
  }

  while (basicCount < requiredBasic) {
    // Add 0-allocation to a non-basic cell that doesn't create a cycle
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (allocation[i][j] === null) {
          allocation[i][j] = 0;
          const cycle = findCycle([i, j], allocation, rows, cols);
          if (cycle && cycle.length > 2) {
            // This creates a cycle with existing basic cells — undo
            allocation[i][j] = null;
            continue;
          }
          basicCount++;
          if (basicCount >= requiredBasic) return;
        }
      }
    }
    break;
  }
}

function solveDualVariables(
  profitMatrix: number[][],
  allocation: (number | null)[][],
  rows: number,
  cols: number
): { alpha: (number | null)[]; beta: (number | null)[] } {
  const alpha: (number | null)[] = new Array(rows).fill(null);
  const beta: (number | null)[] = new Array(cols).fill(null);

  // Set α_0 = 0
  alpha[0] = 0;

  let changed = true;
  let safety = 0;
  while (changed && safety < rows * cols * 2) {
    changed = false;
    safety++;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (allocation[i][j] === null) continue;
        if (profitMatrix[i][j] === BLOCKED) continue;

        if (alpha[i] !== null && beta[j] === null) {
          beta[j] = profitMatrix[i][j] - alpha[i]!;
          changed = true;
        } else if (beta[j] !== null && alpha[i] === null) {
          alpha[i] = profitMatrix[i][j] - beta[j]!;
          changed = true;
        }
      }
    }
  }

  return { alpha, beta };
}

function computeDeltas(
  profitMatrix: number[][],
  allocation: (number | null)[][],
  alpha: (number | null)[],
  beta: (number | null)[],
  rows: number,
  cols: number
): (number | null)[][] {
  const delta: (number | null)[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(null)
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (allocation[i][j] !== null) continue;
      if (profitMatrix[i][j] === BLOCKED) continue;
      if (alpha[i] === null || beta[j] === null) continue;
      delta[i][j] = profitMatrix[i][j] - alpha[i]! - beta[j]!;
    }
  }

  return delta;
}

function computeTotalProfit(
  profitMatrix: number[][],
  allocation: (number | null)[][],
  rows: number,
  cols: number
): number {
  let total = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (allocation[i][j] !== null && allocation[i][j]! > 0 && profitMatrix[i][j] !== BLOCKED) {
        total += profitMatrix[i][j] * allocation[i][j]!;
      }
    }
  }
  return total;
}

interface SnapshotArgs {
  step: number;
  description: string;
  profitMatrix: number[][];
  allocation: (number | null)[][];
  remainingSupply: number[];
  remainingDemand: number[];
  selectedCell: [number, number] | null;
  bp: BalancedProblem;
  isInitialPhase: boolean;
  alpha?: (number | null)[];
  beta?: (number | null)[];
  delta?: (number | null)[][];
  cycleNodes?: [number, number][];
  cycleSigns?: ('+' | '-')[];
  isOptimal?: boolean;
}

function makeSnapshot(args: SnapshotArgs): IterationSnapshot {
  const { rows, cols } = args.bp;
  return {
    step: args.step,
    description: args.description,
    profitMatrix: deepCopy2D(args.profitMatrix),
    allocation: deepCopy2D(args.allocation),
    remainingSupply: [...args.remainingSupply],
    remainingDemand: [...args.remainingDemand],
    alpha: args.alpha ? [...args.alpha] : new Array(rows).fill(null),
    beta: args.beta ? [...args.beta] : new Array(cols).fill(null),
    delta: args.delta ? deepCopy2D(args.delta) : Array.from({ length: rows }, () => new Array(cols).fill(null)),
    selectedCell: args.selectedCell,
    cycleNodes: args.cycleNodes ?? [],
    cycleSigns: args.cycleSigns ?? [],
    isFictitious: {
      rows: [...args.bp.fictitiousRows],
      cols: [...args.bp.fictitiousCols],
    },
    totalProfit: computeTotalProfit(args.profitMatrix, args.allocation, rows, cols),
    isOptimal: args.isOptimal ?? false,
    isInitialPhase: args.isInitialPhase,
  };
}

export function solve(input: ProblemInput): SolveResult {
  try {
    const rawProfit = buildProfitMatrix(input);
    const bp = balance(
      rawProfit,
      input.suppliers.map((s) => s.podaz),
      input.receivers.map((r) => r.popyt)
    );

    const { allocation, steps: initialSteps } = maximumElementMethod(bp);
    const { rows, cols } = bp;

    handleDegeneracy(allocation, rows, cols);

    const allIterations: IterationSnapshot[] = [...initialSteps];
    let iterCount = initialSteps.length;

    for (let loop = 0; loop < MAX_ITERATIONS; loop++) {
      const { alpha, beta } = solveDualVariables(bp.profitMatrix, allocation, rows, cols);
      const delta = computeDeltas(bp.profitMatrix, allocation, alpha, beta, rows, cols);

      // Find max positive delta
      let maxDelta = 0;
      let enteringCell: [number, number] | null = null;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (delta[i][j] !== null && delta[i][j]! > maxDelta) {
            maxDelta = delta[i][j]!;
            enteringCell = [i, j];
          }
        }
      }

      const supply = bp.supply.map((_, i) => {
        let used = 0;
        for (let j = 0; j < cols; j++) {
          if (allocation[i][j] !== null) used += allocation[i][j]!;
        }
        return bp.supply[i] - used;
      });
      const demand = bp.demand.map((_, j) => {
        let used = 0;
        for (let i = 0; i < rows; i++) {
          if (allocation[i][j] !== null) used += allocation[i][j]!;
        }
        return bp.demand[j] - used;
      });

      if (!enteringCell) {
        // Optimal solution found
        allIterations.push(
          makeSnapshot({
            step: iterCount++,
            description: 'Rozwiązanie optymalne! Wszystkie Δ_ij ≤ 0.',
            profitMatrix: bp.profitMatrix,
            allocation,
            remainingSupply: supply,
            remainingDemand: demand,
            selectedCell: null,
            bp,
            isInitialPhase: false,
            alpha,
            beta,
            delta,
            isOptimal: true,
          })
        );
        break;
      }

      // Find cycle
      const cycle = findCycle(enteringCell, allocation, rows, cols);
      if (!cycle || cycle.length < 4) {
        allIterations.push(
          makeSnapshot({
            step: iterCount++,
            description: 'Nie udało się znaleźć cyklu. Rozwiązanie może być zdegenerowane.',
            profitMatrix: bp.profitMatrix,
            allocation,
            remainingSupply: supply,
            remainingDemand: demand,
            selectedCell: enteringCell,
            bp,
            isInitialPhase: false,
            alpha,
            beta,
            delta,
            isOptimal: true,
          })
        );
        break;
      }

      // Signs: entering cell gets +, then alternating -, +, -, ...
      const signs: ('+' | '-')[] = cycle.map((_, idx) => (idx % 2 === 0 ? '+' : '-'));

      // Find theta = min allocation among - cells
      let theta = Infinity;
      for (let k = 0; k < cycle.length; k++) {
        if (signs[k] === '-') {
          const [cr, cc] = cycle[k];
          const val = allocation[cr][cc] ?? 0;
          if (val < theta) theta = val;
        }
      }

      // Save snapshot before redistribution
      allIterations.push(
        makeSnapshot({
          step: iterCount++,
          description: `Δ_max = ${maxDelta.toFixed(2)} w [${enteringCell[0] + 1}, ${enteringCell[1] + 1}]. Θ = ${theta}. Pętla zmian.`,
          profitMatrix: bp.profitMatrix,
          allocation,
          remainingSupply: supply,
          remainingDemand: demand,
          selectedCell: enteringCell,
          bp,
          isInitialPhase: false,
          alpha,
          beta,
          delta,
          cycleNodes: cycle,
          cycleSigns: signs,
        })
      );

      // Apply redistribution
      for (let k = 0; k < cycle.length; k++) {
        const [cr, cc] = cycle[k];
        const current = allocation[cr][cc] ?? 0;
        if (signs[k] === '+') {
          allocation[cr][cc] = current + theta;
        } else {
          const newVal = current - theta;
          if (newVal === 0) {
            // Remove from basis (but keep entering cell)
            if (k !== 0) {
              allocation[cr][cc] = null;
            } else {
              allocation[cr][cc] = 0;
            }
          } else {
            allocation[cr][cc] = newVal;
          }
        }
      }

      // Remove exactly one cell that became 0 with '-' sign (the leaving variable)
      // Keep the entering cell even if it got 0
      let removed = false;
      for (let k = cycle.length - 1; k >= 1; k--) {
        if (signs[k] === '-') {
          const [cr, cc] = cycle[k];
          if (allocation[cr][cc] === 0 && !removed) {
            allocation[cr][cc] = null;
            removed = true;
          }
        }
      }

      handleDegeneracy(allocation, rows, cols);
    }

    // If we never added an optimal step, add one now
    const lastStep = allIterations[allIterations.length - 1];
    if (!lastStep.isOptimal && allIterations.length >= MAX_ITERATIONS) {
      return {
        iterations: allIterations,
        error: 'Przekroczono maksymalną liczbę iteracji.',
      };
    }

    return { iterations: allIterations, error: null };
  } catch (err) {
    return {
      iterations: [],
      error: `Błąd obliczeń: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
