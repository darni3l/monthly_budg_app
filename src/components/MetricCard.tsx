interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'neutral' | 'green' | 'red' | 'amber' | 'blue';
}

const toneClasses = {
  neutral: 'text-slate-950',
  green: 'text-emerald-700',
  red: 'text-rose-700',
  amber: 'text-amber-700',
  blue: 'text-blue-700',
};

export function MetricCard({ label, value, sub, tone = 'neutral' }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`font-mono text-2xl font-extrabold leading-none ${toneClasses[tone]}`}>
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-slate-400">{sub}</p> : null}
    </div>
  );
}
