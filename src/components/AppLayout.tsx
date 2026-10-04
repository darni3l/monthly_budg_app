import {
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Download,
  Home,
  PiggyBank,
  ReceiptText,
  RotateCcw,
  Target,
  Upload,
} from 'lucide-react';
import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { Metadata, TabRoute } from '../types';
import { currency } from '../utils/format';
import { Button } from './Button';
import { InstallPrompt } from './InstallPrompt';

interface NavItem {
  to: TabRoute;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/income', label: 'Income', icon: CircleDollarSign },
  { to: '/expenses', label: 'Expenses', icon: ReceiptText },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/trends', label: 'Trends', icon: BarChart3 },
  { to: '/planner', label: 'Planner', icon: ClipboardList },
];

interface AppLayoutProps {
  children: ReactNode;
  metadata: Metadata;
  remaining: number;
  onExportBackup: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onImportRaw: (raw: string) => void;
  onReset: () => void;
}

export function AppLayout({
  children,
  metadata,
  remaining,
  onExportBackup,
  onExportCSV,
  onExportPDF,
  onImportRaw,
  onReset,
}: AppLayoutProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthLabel = new Date(metadata.year, metadata.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const progress = daysInMonth > 0 ? currentDay / daysInMonth : 0;
  const accentColor = remaining < 0 ? '#fb7185' : remaining <= 100 ? '#f59e0b' : '#34d399';

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset immediately so selecting the same file again still fires onChange.
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImportRaw(reader.result);
      }
    };
    reader.onerror = () => {
      window.alert('Could not read that file.');
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-950"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <aside
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-64 lg:border-r lg:border-t-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="hidden border-b border-slate-800 px-5 py-6 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
              <PiggyBank className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-300">
                Budgetly
              </p>
              <p className="text-sm text-slate-400">{month}</p>
            </div>
          </div>
        </div>

        <nav className="grid grid-cols-6 lg:block lg:px-3 lg:py-4" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 border-t-2 px-2 text-xs font-semibold transition lg:min-h-0 lg:flex-row lg:justify-start lg:rounded-md lg:border-l-2 lg:border-t-0 lg:px-3 lg:py-3 lg:text-sm ${
                    isActive
                      ? 'border-blue-500 bg-slate-900 text-white'
                      : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`
                }
                end={item.to === '/'}
                key={item.to}
                to={item.to}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden border-t border-slate-800 p-5 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:block">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Monthly snapshot
          </p>
          <p className="text-sm font-semibold text-slate-200">{monthLabel}</p>
          <p className="mt-2 font-mono text-2xl font-extrabold" style={{ color: accentColor }}>
            {currency(remaining)}
          </p>
          <p className="text-xs text-slate-500">remaining balance</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800" style={{ backgroundColor: '#0f172a' }}>
            <div
              className="h-1 rounded-full"
              style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, backgroundColor: accentColor }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Day {currentDay} of {daysInMonth}</p>
        </div>
      </aside>

      <main className="min-h-screen pb-28 lg:ml-64 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="lg:hidden">
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
                Budgetly
              </p>
              <p className="text-sm text-slate-500">{month}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Button onClick={onExportBackup} type="button">
                <Download className="h-4 w-4" aria-hidden="true" />
                Backup
              </Button>
              <Button onClick={onExportCSV} type="button">
                <Download className="h-4 w-4" aria-hidden="true" />
                CSV
              </Button>
              <Button onClick={onExportPDF} type="button">
                <Download className="h-4 w-4" aria-hidden="true" />
                PDF
              </Button>
              <Button onClick={handleImportClick} type="button" variant="ghost">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import
              </Button>
              <input
                accept="application/json,.json"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              <Button onClick={onReset} type="button" variant="ghost">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>

          {/* Mobile-only Monthly Snapshot — now part of normal scrolling
              content instead of living inside the fixed bottom nav, so it
              can't grow the pinned footer past the space main reserves for
              it (pb-28 above). Desktop gets its own version further down,
              inside the fixed sidebar. */}
          <div className="mb-4 rounded-lg bg-slate-950 px-4 py-4 text-slate-100 lg:hidden">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Monthly snapshot
            </p>
            <p className="text-sm font-semibold text-slate-200">{monthLabel}</p>
            <p className="mt-2 font-mono text-xl font-extrabold" style={{ color: accentColor }}>
              {currency(remaining)}
            </p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Day {currentDay} of {daysInMonth}
            </p>
          </div>

          <InstallPrompt />
          {children}
        </div>
      </main>
    </div>
  );
}
