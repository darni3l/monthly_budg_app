import { CheckCircle2, TriangleAlert, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'warning' | 'danger';
  children: ReactNode;
}

const styles = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  danger: {
    icon: XCircle,
    className: 'border-rose-200 bg-rose-50 text-rose-800',
  },
};

export function Alert({ type, children }: AlertProps) {
  const Icon = styles[type].icon;

  return (
    <div
      className={`mb-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${styles[type].className}`}
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
