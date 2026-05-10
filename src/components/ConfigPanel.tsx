interface ConfigPanelProps {
  m: number;
  n: number;
  onChangeM: (val: number) => void;
  onChangeN: (val: number) => void;
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M2 4.5l5 5 5-5" />
    </svg>
  );
}

function SelectRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-black">
      <span className="text-[18px]">{label}</span>
      <div className="relative flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="text-[18px] font-medium bg-transparent border-none outline-none cursor-pointer pr-6"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
          <ChevronDown />
        </span>
      </div>
    </div>
  );
}

export function ConfigPanel({ m, n, onChangeM, onChangeN }: ConfigPanelProps) {
  return (
    <section className="px-16 py-6">
      <div className="flex items-start justify-between gap-8">
        <h2 className="text-[24px] font-medium pt-3">Ustawienia zadania</h2>
        <div className="flex-1 max-w-xs">
          <SelectRow label="Dostawcy (m):" value={m} onChange={onChangeM} />
          <SelectRow label="Odbiorcy (n):" value={n} onChange={onChangeN} />
        </div>
      </div>
    </section>
  );
}
