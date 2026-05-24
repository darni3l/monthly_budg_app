import type { ReactNode, TdHTMLAttributes } from 'react';

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="-mx-2 overflow-x-auto px-2">{children}</div>;
}

export function Table({ children }: { children: ReactNode }) {
  return <table className="min-w-full border-collapse">{children}</table>;
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="border-b border-slate-100 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

export function Td({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`border-b border-slate-50 px-3 py-3 text-sm text-slate-700 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export function TotalRow({
  label,
  value,
  accent = 'text-slate-950',
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className={`font-mono text-lg font-extrabold ${accent}`}>{value}</span>
    </div>
  );
}
