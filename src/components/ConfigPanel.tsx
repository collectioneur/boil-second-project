interface ConfigPanelProps {
  m: number;
  n: number;
  onChangeM: (val: number) => void;
  onChangeN: (val: number) => void;
}

export function ConfigPanel({ m, n, onChangeM, onChangeN }: ConfigPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Rozmiar zadania
      </h2>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Dostawcy (m): <span className="font-bold text-slate-800">{m}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={m}
            onChange={(e) => onChangeM(Number(e.target.value))}
            className="w-full accent-slate-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Odbiorcy (n): <span className="font-bold text-slate-800">{n}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={n}
            onChange={(e) => onChangeN(Number(e.target.value))}
            className="w-full accent-slate-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
