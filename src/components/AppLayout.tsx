import {
  BarChart3,
  CircleDollarSign,
  Download,
  Home,
  PiggyBank,
  ReceiptText,
  RotateCcw,
  Target,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { TabRoute } from '../types';
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
];

interface AppLayoutProps {
  children: ReactNode;
  remaining: number;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onReset: () => void;
}

export function AppLayout({
  children,
  remaining,
  onExportCSV,
  onExportPDF,
  onReset,
}: AppLayoutProps) {
  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-64 lg:border-r lg:border-t-0">
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

        <nav className="grid grid-cols-5 lg:block lg:px-3 lg:py-4" aria-label="Primary">
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
          <p
            className={`font-mono text-2xl font-extrabold ${remaining < 0 ? 'text-rose-300' : 'text-emerald-300'}`}
          >
            {currency(remaining)}
          </p>
          <p className="text-xs text-slate-500">remaining balance</p>
        </div>
      </aside>

      <main className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="lg:hidden">
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
                Budgetly
              </p>
              <p className="text-sm text-slate-500">{month}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Button onClick={onExportCSV} type="button">
                <Download className="h-4 w-4" aria-hidden="true" />
                CSV
              </Button>
              <Button onClick={onExportPDF} type="button">
                <Download className="h-4 w-4" aria-hidden="true" />
                PDF
              </Button>
              <Button onClick={onReset} type="button" variant="ghost">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
          <InstallPrompt />
          {children}
        </div>
      </main>
    </div>
  );
}
