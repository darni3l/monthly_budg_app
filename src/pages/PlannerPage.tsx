import { useEffect, useState } from 'react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeader } from '../components/SectionHeader';
import { categoryLabels } from '../constants';
import type { Category } from '../types';
import { currency } from '../utils/format';
import { useBudgetContext } from './useBudgetContext';

function PlanAmountInput({
  ariaLabel,
  onSave,
  value,
}: {
  ariaLabel: string;
  onSave: (amount: number) => void;
  value: number;
}) {
  const [draft, setDraft] = useState(value ? String(value) : '');

  useEffect(() => {
    setDraft(value ? String(value) : '');
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    const parsed = trimmed === '' ? 0 : Number(trimmed);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onSave(parsed);
    } else {
      // Invalid entry — revert rather than keep bad input.
      setDraft(value ? String(value) : '');
    }
  };

  return (
    <input
      aria-label={ariaLabel}
      className="w-28 rounded-md border border-slate-200 bg-white px-2 py-1 text-right font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      inputMode="decimal"
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          (event.target as HTMLInputElement).blur();
        }
      }}
      placeholder="0"
      type="text"
      value={draft}
    />
  );
}

export function PlannerPage() {
  const {
    budget: { data, totals, currentPlan, previousPlan, upsertPlan, copyPreviousMonthPlan },
  } = useBudgetContext();

  const plannedIncome = currentPlan?.plannedIncome ?? 0;
  const categoryAllocations = currentPlan?.categoryAllocations ?? {};
  const notes = currentPlan?.notes ?? '';

  const totalAllocated = (Object.keys(categoryLabels) as Category[]).reduce(
    (sum, category) => sum + (categoryAllocations[category] || 0),
    0,
  );
  const unallocated = plannedIncome - totalAllocated;

  // Subscription and savings actuals come exclusively from their own
  // dedicated lists (the Trends page's subscription tracker, and the Goals
  // page's savings contributions) — never from Expense items of the same
  // category, so nothing gets counted twice. Mirrors DashboardPage's logic
  // exactly, so the Planner's "actual" figures always agree with the
  // Dashboard's.
  const actualByCategory = (category: Category) => {
    if (category === 'subscription') {
      return data.subscriptions.reduce((sum, item) => sum + item.amount, 0);
    }
    if (category === 'savings') {
      return data.savings.reduce((sum, item) => sum + item.amount, 0);
    }
    return data.expenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <>
      <SectionHeader
        subtitle="Plan this month's income and spending before it happens."
        title="Planner"
      />

      {unallocated < 0 ? (
        <Alert type="danger">
          Planned expenses exceed planned income by{' '}
          <strong>{currency(Math.abs(unallocated))}</strong>.
        </Alert>
      ) : null}

      <Card
        action={
          previousPlan ? (
            <Button onClick={copyPreviousMonthPlan} type="button" variant="ghost">
              Copy last month&apos;s plan
            </Button>
          ) : undefined
        }
        title="Planned income"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Planned
            </p>
            <PlanAmountInput
              ariaLabel="Planned monthly income"
              onSave={(amount) => upsertPlan({ plannedIncome: amount })}
              value={plannedIncome}
            />
          </div>
          <div className="text-right">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Actual so far
            </p>
            <p className="font-mono text-lg font-extrabold text-emerald-700">
              {currency(totals.totalIncome)}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Unallocated
            </p>
            <p
              className={`font-mono text-lg font-extrabold ${
                unallocated < 0 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {currency(unallocated)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4" title="Category allocations">
        <div className="grid gap-4">
          {(Object.keys(categoryLabels) as Category[]).map((category) => {
            const planned = categoryAllocations[category] || 0;
            const actual = actualByCategory(category);

            return (
              <div key={category}>
                <ProgressBar
                  label={categoryLabels[category]}
                  max={planned || actual}
                  sublabel={`${currency(actual)}${
                    planned ? ` / ${currency(planned)} planned` : ' (no plan set)'
                  }`}
                  value={actual}
                />
                <div className="mt-1 flex items-center justify-end gap-2 text-xs text-slate-400">
                  <span>Planned amount</span>
                  <PlanAmountInput
                    ariaLabel={`Planned amount for ${categoryLabels[category]}`}
                    onSave={(amount) => upsertPlan({ categoryAllocations: { [category]: amount } })}
                    value={planned}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-4" title="Notes">
        <textarea
          className="min-h-24 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          defaultValue={notes}
          key={`${data.metadata.month}-${data.metadata.year}`}
          onBlur={(event) => upsertPlan({ notes: event.target.value })}
          placeholder="Anything worth remembering about this month's plan..."
        />
      </Card>
    </>
  );
}
