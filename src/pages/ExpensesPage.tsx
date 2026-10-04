import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RowActions } from '../components/RowActions';
import { SectionHeader } from '../components/SectionHeader';
import { Table, TableWrap, Td, Th, TotalRow } from '../components/Table';
import { categoryLabels } from '../constants';
import type { Category } from '../types';
import { currency } from '../utils/format';
import { getSpendingPace, type PaceStatus } from '../utils/pacing';
import { useBudgetContext } from './useBudgetContext';

const paceBadgeClasses: Record<PaceStatus, string> = {
  early: 'bg-emerald-100 text-emerald-700',
  'on-track': 'bg-blue-100 text-blue-700',
  'over-pace': 'bg-amber-100 text-amber-800',
};

// Display order: variable first (day-to-day spending you're actively
// watching), then subscription, fixed, debt. "savings" isn't part of your
// requested order — placed last since it wasn't specified; move it if you'd
// rather have it elsewhere.
const CATEGORY_ORDER: Category[] = ['variable', 'subscription', 'fixed', 'debt', 'savings'];

export function ExpensesPage() {
  const {
    budget: { data, totals, deleteItem },
    openModal,
  } = useBudgetContext();
  const [filter, setFilter] = useState<Category | 'all'>('all');

  const expenses = (
    filter === 'all' ? data.expenses : data.expenses.filter((item) => item.category === filter)
  )
    .slice()
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));

  return (
    <>
      <SectionHeader
        action={
          <Button onClick={() => openModal('expense')} type="button" variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add expense
          </Button>
        }
        subtitle="Manage fixed, variable, debt, and subscription-adjacent spending."
        title="Expenses"
      />
      <Card>
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Expense category filters">
          {(['all', ...Object.keys(categoryLabels)] as Array<Category | 'all'>).map((category) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                filter === category
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              key={category}
              onClick={() => setFilter(category)}
              type="button"
            >
              {category === 'all' ? 'All' : categoryLabels[category]}
            </button>
          ))}
        </div>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Limit</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => {
                const over = item.limit > 0 && item.amount > item.limit;
                const pace =
                  !over && item.category === 'variable'
                    ? getSpendingPace(item.amount, item.limit)
                    : null;

                return (
                  <tr
                    className={over ? 'bg-rose-50/60' : 'transition hover:bg-slate-50'}
                    key={item.id}
                  >
                    <Td className="min-w-48 font-semibold">
                      {item.name}
                      {over ? (
                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                          Over limit
                        </span>
                      ) : pace ? (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${paceBadgeClasses[pace.status]}`}
                          title={`Projected total this month: ${currency(pace.projected)}`}
                        >
                          {pace.label}
                        </span>
                      ) : null}
                    </Td>
                    <Td>
                      <Badge category={item.category} />
                    </Td>
                    <Td
                      className={`font-mono font-bold ${over ? 'text-rose-700' : 'text-slate-900'}`}
                    >
                      {currency(item.amount)}
                    </Td>
                    <Td className="font-mono text-slate-400">
                      {item.limit ? currency(item.limit) : '-'}
                    </Td>
                    <Td>
                      <RowActions
                        onDelete={() => deleteItem('expense', item.id)}
                        onEdit={() => openModal('expense', item)}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
        <TotalRow
          accent="text-rose-700"
          label="Total expenses"
          value={currency(totals.totalExpenses)}
        />
      </Card>
    </>
  );
}
