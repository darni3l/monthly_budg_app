import { percent } from '../utils/format';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  sublabel: string;
}

export function ProgressBar({ value, max, label, sublabel }: ProgressBarProps) {
  const progress = percent(value, max);
  const color =
    progress >= 100 ? 'bg-rose-500' : progress >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className={progress >= 100 ? 'font-semibold text-rose-700' : 'text-slate-500'}>
          {sublabel}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
