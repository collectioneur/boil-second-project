import type { Supplier, Receiver } from '../solver/types';

interface DataInputFormProps {
  m: number;
  n: number;
  suppliers: Supplier[];
  receivers: Receiver[];
  transportCosts: number[][];
  blockedRoutes: boolean[][];
  onSupplierChange: (index: number, field: 'podaz' | 'kosztZakupu', value: number) => void;
  onReceiverChange: (index: number, field: 'popyt' | 'cenaSprzedazy', value: number) => void;
  onTransportCostChange: (i: number, j: number, value: number) => void;
  onToggleBlock: (i: number, j: number) => void;
}

function NumInput({
  value,
  onChange,
  disabled = false,
  dim = false,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  dim?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      disabled={disabled}
      className={`w-12 text-center text-[18px] bg-transparent border-none outline-none focus:underline
        ${dim ? 'text-black/30 line-through' : 'text-black'}
        disabled:cursor-not-allowed`}
    />
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return locked ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="2" y="6.5" width="10" height="6.5" />
      <path d="M4.5 6.5V5a2.5 2.5 0 015 0v1.5" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="2" y="6.5" width="10" height="6.5" />
      <path d="M4.5 6.5V5a2.5 2.5 0 015 0V3.5" />
    </svg>
  );
}

const cellBase = 'py-3 text-center border-b border-black';
const cellMinW = 'min-w-[80px]';

export function DataInputForm({
  m,
  n,
  suppliers,
  receivers,
  transportCosts,
  blockedRoutes,
  onSupplierChange,
  onReceiverChange,
  onTransportCostChange,
  onToggleBlock,
}: DataInputFormProps) {
  return (
    <section className="px-16 py-6">
      <h2 className="text-[24px] font-medium mb-6">Dane wejściowe</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${cellBase} text-left text-[18px] font-medium w-16`} />
              {receivers.slice(0, n).map((_, j) => (
                <th
                  key={j}
                  className={`${cellBase} ${cellMinW} text-[18px] font-medium border-b-2 border-black`}
                >
                  O{j + 1}
                </th>
              ))}
              <th className={`${cellBase} ${cellMinW} text-[18px] font-medium border-b-2 border-black`}>
                Podaż
              </th>
              <th className={`${cellBase} ${cellMinW} text-[18px] font-medium border-b-2 border-black`}>
                k<sub>z</sub>
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.slice(0, m).map((sup, i) => (
              <tr key={i} className="hover:bg-[#F2F2F2] transition-colors">
                <td className={`${cellBase} text-left text-[18px] font-medium`}>
                  D{i + 1}
                </td>
                {receivers.slice(0, n).map((_, j) => {
                  const blocked = blockedRoutes[i]?.[j] ?? false;
                  return (
                    <td
                      key={j}
                      className={`${cellBase} ${cellMinW} ${blocked ? 'bg-[#F2F2F2]' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <NumInput
                          value={transportCosts[i]?.[j] ?? 0}
                          onChange={(v) => onTransportCostChange(i, j, v)}
                          disabled={blocked}
                          dim={blocked}
                        />
                        <button
                          onClick={() => onToggleBlock(i, j)}
                          className={`transition-opacity ${
                            blocked
                              ? 'text-black opacity-80'
                              : 'text-black opacity-25 hover:opacity-70'
                          }`}
                          title={blocked ? 'Odblokuj trasę' : 'Zablokuj trasę'}
                        >
                          <LockIcon locked={blocked} />
                        </button>
                      </div>
                    </td>
                  );
                })}
                <td className={`${cellBase} ${cellMinW}`}>
                  <NumInput
                    value={sup.podaz}
                    onChange={(v) => onSupplierChange(i, 'podaz', v)}
                  />
                </td>
                <td className={`${cellBase} ${cellMinW}`}>
                  <NumInput
                    value={sup.kosztZakupu}
                    onChange={(v) => onSupplierChange(i, 'kosztZakupu', v)}
                  />
                </td>
              </tr>
            ))}
            <tr className="hover:bg-[#F2F2F2] transition-colors">
              <td className={`${cellBase} text-left text-[18px] font-medium`}>Popyt</td>
              {receivers.slice(0, n).map((rec, j) => (
                <td key={j} className={`${cellBase} ${cellMinW}`}>
                  <NumInput
                    value={rec.popyt}
                    onChange={(v) => onReceiverChange(j, 'popyt', v)}
                  />
                </td>
              ))}
              <td className={`${cellBase}`} colSpan={2} />
            </tr>
            <tr className="hover:bg-[#F2F2F2] transition-colors">
              <td className={`${cellBase} text-left text-[18px] font-medium`}>
                Cena&nbsp;(c)
              </td>
              {receivers.slice(0, n).map((rec, j) => (
                <td key={j} className={`${cellBase} ${cellMinW}`}>
                  <NumInput
                    value={rec.cenaSprzedazy}
                    onChange={(v) => onReceiverChange(j, 'cenaSprzedazy', v)}
                  />
                </td>
              ))}
              <td className={`${cellBase}`} colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[14px] text-black/40 mt-4">
        k<sub>t</sub> — koszt transportu · k<sub>z</sub> — koszt zakupu ·
        c — cena sprzedaży · Zysk: z = c − k<sub>z</sub> − k<sub>t</sub>
      </p>
    </section>
  );
}
