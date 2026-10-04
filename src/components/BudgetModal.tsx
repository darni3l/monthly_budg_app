import { X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
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

const MODAL_TITLE_ID = 'budget-modal-title';
const NAME_ERROR_ID = 'budget-modal-name-error';
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function BudgetModal({ section, editItem, onClose, onSave }: BudgetModalProps) {
  const [form, setForm] = useState<FormState>({});
  const [nameError, setNameError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const prevSectionRef = useRef<BudgetSection | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Capture whatever had focus right before the modal opens (e.g. the "Add
  // expense" button), so we can return focus to it on close. Reading
  // document.activeElement here — during render, before this modal's own
  // markup is committed — is what keeps this from racing the Name field's
  // autoFocus.
  if (section && !prevSectionRef.current) {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
  }
  prevSectionRef.current = section;

  useEffect(() => {
    if (!section) return;
    setForm(editItem ? { ...editItem } : defaults[section]);
    setNameError(false);
  }, [editItem, section]);

  useEffect(() => {
    if (section || !previousFocusRef.current) return;
    previousFocusRef.current.focus();
    previousFocusRef.current = null;
  }, [section]);

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

  const trapFocus = (event: ReactKeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Tab' || !formRef.current) return;

    const focusable = formRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
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
        aria-labelledby={MODAL_TITLE_ID}
        aria-modal="true"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft"
        onKeyDown={trapFocus}
        onSubmit={(event) => {
          event.preventDefault();
          if (!String(form.name || '').trim()) {
            setNameError(true);
            return;
          }
          onSave(section, form);
        }}
        ref={formRef}
        role="dialog"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-950" id={MODAL_TITLE_ID}>
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
              aria-describedby={nameError ? NAME_ERROR_ID : undefined}
              aria-invalid={nameError}
              aria-required="true"
              autoFocus
              className={`rounded-md border bg-slate-50 px-3 py-2 text-slate-950 outline-none transition focus:ring-2 ${
                nameError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              onChange={(event) => {
                setField('name', event.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder="e.g. Netflix"
              value={String(form.name || '')}
            />
            {nameError ? (
              <span className="text-xs font-semibold text-rose-600" id={NAME_ERROR_ID} role="alert">
                Name is required.
              </span>
            ) : null}
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
