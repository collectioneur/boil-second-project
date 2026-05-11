import { describe, it, expect } from "vitest";
import { solve } from "./solver";
import type { ProblemInput } from "./types";

describe("solve", () => {
  it("2 suppliers, 3 receivers, supply > demand → optimal profit = 196", () => {
    const input: ProblemInput = {
      m: 2,
      n: 3,
      suppliers: [
        { id: 0, podaz: 20, kosztZakupu: 7 },
        { id: 1, podaz: 40, kosztZakupu: 8 },
      ],
      receivers: [
        { id: 0, popyt: 16, cenaSprzedazy: 18 },
        { id: 1, popyt: 12, cenaSprzedazy: 16 },
        { id: 2, popyt: 24, cenaSprzedazy: 15 },
      ],
      transportCosts: [
        [4, 7, 2],
        [8, 10, 4],
      ],
      blockedRoutes: [
        [false, false, false],
        [false, false, false],
      ],
    };

    const result = solve(input);

    expect(result.error).toBeNull();
    expect(result.iterations.length).toBeGreaterThan(0);

    const lastIteration = result.iterations[result.iterations.length - 1];
    expect(lastIteration.isOptimal).toBe(true);
    expect(lastIteration.totalProfit).toBe(196);
  });
});
