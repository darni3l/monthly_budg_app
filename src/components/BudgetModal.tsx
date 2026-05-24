import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { categoryLabels } from '../constants';
import type { BudgetItem, BudgetSection } from '../types';
import { Button } from './Button';

type FormState = Record<string, string | number>;

interface BudgetModalProps {
  section: BudgetSection | null;
  editItem?: BudgetItem | null;
  onClose: () => void;
  onSave: (section: BudgetSection, item: FormState) => void;
}

const titles: Record<BudgetSection, string> = {
  income: 'Income source',
  expense: 'Expense',
  saving: 'Savings contribution',
  goal: 'Financial goal',
  subscription: 'Subscription',
};

const defaults: Record<BudgetSection, FormState> = {
  income: { name: '', amount: 0, frequency: 'monthly' },
  expense: { name: '', amount: 0, limit: 0, category: 'variable' },
  saving: { name: '', amount: 0 },
  goal: { name: '', target: 0, current: 0 },
  subscription: { name: '', amount: 0, renewal: 'Monthly' },
};

export function BudgetModal({ section, editItem, onClose, onSave }: BudgetModalProps) {
  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    if (!section) return;
    setForm(editItem ? { ...editItem } : defaults[section]);
  }, [editItem, section]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (!section) return null;

  const setField = (key: string, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const numberInput = (key: string, label: string, step = '1') => (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
      {label}
      <input
        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        min="0"
        onChange={(event) => setField(key, Number.parseFloat(event.target.value) || 0)}
        placeholder="0"
        step={step}
        type="number"
        value={form[key] || ''}
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <form
        aria-modal="true"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault();
          if (!String(form.name || '').trim()) return;
          onSave(section, form);
        }}
        role="dialog"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-950">
            {editItem ? 'Edit' : 'Add'} {titles[section]}
          </h2>
          <button
            aria-label="Close dialog"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
            Name
            <input
              autoFocus
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onChange={(event) => setField('name', event.target.value)}
              placeholder="e.g. Netflix"
              value={String(form.name || '')}
            />
          </label>

          {['income', 'expense', 'saving', 'subscription'].includes(section) &&
            numberInput(
              'amount',
              section === 'subscription' ? 'Monthly cost (€)' : 'Amount (€)',
              section === 'subscription' ? '0.01' : '1',
            )}

          {section === 'income' ? (
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
              Frequency
              <select
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => setField('frequency', event.target.value)}
                value={String(form.frequency || 'monthly')}
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
                <option value="annual">Annual</option>
              </select>
            </label>
          ) : null}

          {section === 'expense' ? (
            <>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
                Category
                <select
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setField('category', event.target.value)}
                  value={String(form.category || 'variable')}
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {numberInput('limit', 'Monthly limit (€) optional')}
            </>
          ) : null}

          {section === 'goal' ? (
            <>
              {numberInput('target', 'Target amount (€)')}
              {numberInput('current', 'Current amount (€)')}
            </>
          ) : null}

          {section === 'subscription' ? (
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
              Renewal
              <select
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => setField('renewal', event.target.value)}
                value={String(form.renewal || 'Monthly')}
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annual</option>
              </select>
            </label>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
