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
  className = '',
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      disabled={disabled}
      className={`w-full text-center border border-gray-300 rounded px-1 py-1 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
        disabled:bg-gray-100 disabled:text-gray-400 ${className}`}
    />
  );
}

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
    <div className="bg-white rounded-xl shadow p-4 md:p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Dane wejściowe
      </h2>
      <div className="overflow-x-auto">
        <table className="border-collapse mx-auto">
          <thead>
            <tr>
              <th className="p-2 text-xs text-slate-500 border border-gray-200 bg-slate-50" />
              {receivers.slice(0, n).map((_, j) => (
                <th
                  key={j}
                  className="p-2 text-xs font-semibold text-slate-600 border border-gray-200 bg-slate-50 min-w-[80px]"
                >
                  O{j + 1}
                </th>
              ))}
              <th className="p-2 text-xs font-semibold text-blue-600 border border-gray-200 bg-blue-50 min-w-[70px]">
                Podaż
              </th>
              <th className="p-2 text-xs font-semibold text-blue-600 border border-gray-200 bg-blue-50 min-w-[70px]">
                k<sub>z</sub>
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.slice(0, m).map((sup, i) => (
              <tr key={i}>
                <td className="p-2 text-xs font-semibold text-slate-600 border border-gray-200 bg-slate-50">
                  D{i + 1}
                </td>
                {receivers.slice(0, n).map((_, j) => {
                  const blocked = blockedRoutes[i]?.[j] ?? false;
                  return (
                    <td
                      key={j}
                      className={`p-1 border border-gray-300 relative ${
                        blocked ? 'bg-gray-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <NumInput
                          value={transportCosts[i]?.[j] ?? 0}
                          onChange={(v) => onTransportCostChange(i, j, v)}
                          disabled={blocked}
                          className={blocked ? 'line-through opacity-50' : ''}
                        />
                        <button
                          onClick={() => onToggleBlock(i, j)}
                          className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                            blocked
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={blocked ? 'Odblokuj trasę' : 'Zablokuj trasę'}
                        >
                          {blocked ? '🚫' : '🔓'}
                        </button>
                      </div>
                    </td>
                  );
                })}
                <td className="p-1 border border-gray-300 bg-blue-50">
                  <NumInput
                    value={sup.podaz}
                    onChange={(v) => onSupplierChange(i, 'podaz', v)}
                  />
                </td>
                <td className="p-1 border border-gray-300 bg-blue-50">
                  <NumInput
                    value={sup.kosztZakupu}
                    onChange={(v) => onSupplierChange(i, 'kosztZakupu', v)}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td className="p-2 text-xs font-semibold text-green-600 border border-gray-200 bg-green-50">
                Popyt
              </td>
              {receivers.slice(0, n).map((rec, j) => (
                <td key={j} className="p-1 border border-gray-300 bg-green-50">
                  <NumInput
                    value={rec.popyt}
                    onChange={(v) => onReceiverChange(j, 'popyt', v)}
                  />
                </td>
              ))}
              <td className="border border-gray-200 bg-gray-50" colSpan={2} />
            </tr>
            <tr>
              <td className="p-2 text-xs font-semibold text-green-600 border border-gray-200 bg-green-50">
                Cena&nbsp;(c)
              </td>
              {receivers.slice(0, n).map((rec, j) => (
                <td key={j} className="p-1 border border-gray-300 bg-green-50">
                  <NumInput
                    value={rec.cenaSprzedazy}
                    onChange={(v) => onReceiverChange(j, 'cenaSprzedazy', v)}
                  />
                </td>
              ))}
              <td className="border border-gray-200 bg-gray-50" colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">
        k<sub>t</sub> — koszt transportu ·
        k<sub>z</sub> — koszt zakupu ·
        c — cena sprzedaży ·
        Zysk: z = c − k<sub>z</sub> − k<sub>t</sub>
      </p>
    </div>
  );
}
