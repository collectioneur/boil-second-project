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

  function getCellBg(i: number, j: number): string {
    const key = cellKey(i, j);
    const isBlocked = profitMatrix[i][j] === -Infinity;
    const isBasic = allocation[i][j] !== null;
    const isSelected = key === selectedKey;
    const inCycle = cycleMap.has(key);

    if (isBlocked) return 'bg-[#F2F2F2]';
    if (isSelected) return 'bg-[#F2F2F2] outline outline-2 outline-black outline-offset-[-2px]';
    if (inCycle) return 'bg-[#F2F2F2] outline outline-2 outline-black outline-offset-[-2px] outline-dashed';
    if (isBasic) return 'bg-[#F2F2F2]';
    return 'bg-white';
  }

  const thBase = 'py-3 px-2 text-center text-[14px] font-medium border-b-2 border-black';
  const tdBase = 'py-3 px-2 text-center border-b border-black relative';
  const labelTd = 'py-3 px-2 text-left text-[14px] font-medium border-b border-black';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-t border-black">
        <thead>
          <tr>
            <th className={`${thBase} text-left w-12`} />
            {Array.from({ length: cols }, (_, j) => (
              <th
                key={j}
                className={`${thBase} min-w-[80px] ${
                  isFictitious.cols[j] ? 'italic text-black/50' : ''
                }`}
              >
                {isFictitious.cols[j] ? 'FO' : `O${j + 1}`}
              </th>
            ))}
            {!isInitialPhase && (
              <th className={`${thBase} min-w-[60px]`}>
                α<sub>i</sub>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={`${labelTd} ${isFictitious.rows[i] ? 'italic text-black/50' : ''}`}>
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
                  <td key={j} className={`${tdBase} ${getCellBg(i, j)}`}>
                    {isBlocked ? (
                      <span className="text-black/25 text-[18px] font-light select-none">×</span>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[11px] text-black/40 leading-none">
                          z={profit.toFixed(0)}
                        </span>
                        {alloc !== null ? (
                          <span className="text-[18px] font-bold text-black leading-tight">
                            {alloc}
                          </span>
                        ) : d !== null && !isInitialPhase ? (
                          <span
                            className={`text-[13px] font-medium leading-tight ${
                              d > 0 ? 'text-black font-bold' : 'text-black/40'
                            }`}
                          >
                            Δ={d.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-black/20 text-[13px]">—</span>
                        )}
                        {cycleSign && (
                          <span
                            className="absolute top-1 right-1.5 text-[11px] font-bold text-black leading-none"
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
                <td className={`${tdBase} font-mono text-[14px] text-black/60`}>
                  {alpha[i] !== null ? alpha[i]!.toFixed(2) : '—'}
                </td>
              )}
            </tr>
          ))}
          {!isInitialPhase && (
            <tr>
              <td className={`${labelTd} font-medium`}>
                β<sub>j</sub>
              </td>
              {Array.from({ length: cols }, (_, j) => (
                <td key={j} className={`${tdBase} font-mono text-[14px] text-black/60`}>
                  {beta[j] !== null ? beta[j]!.toFixed(2) : '—'}
                </td>
              ))}
              <td className={`${tdBase}`} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
