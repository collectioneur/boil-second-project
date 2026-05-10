import type { IterationSnapshot } from '../../solver/types';

interface TransportTableProps {
  snapshot: IterationSnapshot;
}

function cellKey(i: number, j: number): string {
  return `${i}-${j}`;
}

export function TransportTable({ snapshot }: TransportTableProps) {
  const {
    profitMatrix,
    allocation,
    alpha,
    beta,
    delta,
    selectedCell,
    cycleNodes,
    cycleSigns,
    isFictitious,
    isInitialPhase,
  } = snapshot;

  const rows = profitMatrix.length;
  const cols = profitMatrix[0]?.length ?? 0;

  const cycleMap = new Map<string, '+' | '-'>();
  cycleNodes.forEach(([r, c], idx) => {
    cycleMap.set(cellKey(r, c), cycleSigns[idx]);
  });

  const selectedKey = selectedCell ? cellKey(selectedCell[0], selectedCell[1]) : null;

  function getCellClasses(i: number, j: number): string {
    const key = cellKey(i, j);
    const isBlocked = profitMatrix[i][j] === -Infinity;
    const isBasic = allocation[i][j] !== null;
    const isSelected = key === selectedKey;
    const inCycle = cycleMap.has(key);

    if (isBlocked) return 'bg-gray-200 text-gray-400';
    if (isSelected) return 'bg-green-100 ring-2 ring-green-500 ring-inset';
    if (inCycle) return 'bg-amber-50 ring-2 ring-amber-500 ring-inset';
    if (isBasic) return 'bg-blue-50';
    return 'bg-white';
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse mx-auto text-sm">
        <thead>
          <tr>
            <th className="p-2 border border-gray-300 bg-slate-100 text-xs text-slate-500" />
            {Array.from({ length: cols }, (_, j) => (
              <th
                key={j}
                className={`p-2 border border-gray-300 text-xs font-semibold min-w-[80px] ${
                  isFictitious.cols[j]
                    ? 'bg-yellow-50 text-yellow-700 italic'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isFictitious.cols[j] ? 'FO' : `O${j + 1}`}
              </th>
            ))}
            {!isInitialPhase && (
              <th className="p-2 border border-gray-300 bg-purple-50 text-xs font-semibold text-purple-600">
                α<sub>i</sub>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td
                className={`p-2 border border-gray-300 text-xs font-semibold ${
                  isFictitious.rows[i]
                    ? 'bg-yellow-50 text-yellow-700 italic'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isFictitious.rows[i] ? 'FD' : `D${i + 1}`}
              </td>
              {Array.from({ length: cols }, (_, j) => {
                const key = cellKey(i, j);
                const isBlocked = profitMatrix[i][j] === -Infinity;
                const alloc = allocation[i][j];
                const profit = profitMatrix[i][j];
                const d = delta[i][j];
                const cycleSign = cycleMap.get(key);

                return (
                  <td
                    key={j}
                    className={`p-1.5 border border-gray-300 relative ${getCellClasses(i, j)}`}
                  >
                    {isBlocked ? (
                      <div className="text-center text-gray-400 text-lg">✕</div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-slate-400">
                          z={profit.toFixed(0)}
                        </span>
                        {alloc !== null ? (
                          <span className="font-bold text-base text-slate-800">
                            {alloc}
                          </span>
                        ) : d !== null && !isInitialPhase ? (
                          <span
                            className={`text-xs font-medium ${
                              d > 0 ? 'text-green-600' : 'text-red-500'
                            }`}
                          >
                            Δ={d.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                        {cycleSign && (
                          <span
                            className={`absolute top-0 right-1 text-xs font-bold ${
                              cycleSign === '+' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {cycleSign}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
              {!isInitialPhase && (
                <td className="p-2 border border-gray-300 bg-purple-50 text-center text-xs font-mono text-purple-700">
                  {alpha[i] !== null ? alpha[i]!.toFixed(2) : '—'}
                </td>
              )}
            </tr>
          ))}
          {!isInitialPhase && (
            <tr>
              <td className="p-2 border border-gray-300 bg-purple-50 text-xs font-semibold text-purple-600">
                β<sub>j</sub>
              </td>
              {Array.from({ length: cols }, (_, j) => (
                <td
                  key={j}
                  className="p-2 border border-gray-300 bg-purple-50 text-center text-xs font-mono text-purple-700"
                >
                  {beta[j] !== null ? beta[j]!.toFixed(2) : '—'}
                </td>
              ))}
              <td className="border border-gray-300 bg-gray-50" />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
