import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { RowActions } from '../components/RowActions';
import { SectionHeader } from '../components/SectionHeader';
import { Table, TableWrap, Td, Th, TotalRow } from '../components/Table';
import { currency, percent } from '../utils/format';
import { useBudgetContext } from './useBudgetContext';

export function GoalsPage() {
  const {
    budget: { data, totals, deleteItem },
    openModal,
  } = useBudgetContext();

  return (
    <>
      <SectionHeader
        title="Savings & goals"
        subtitle="Track contributions and financial milestones."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          action={
            <Button onClick={() => openModal('saving')} type="button" variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          }
          title="Savings contributions"
        >
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Account</Th>
                  <Th>Monthly</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {data.savings.map((item) => (
                  <tr className="transition hover:bg-slate-50" key={item.id}>
                    <Td className="font-semibold">{item.name}</Td>
                    <Td className="font-mono font-bold text-blue-700">{currency(item.amount)}</Td>
                    <Td>
                      <RowActions
                        onDelete={() => deleteItem('saving', item.id)}
                        onEdit={() => openModal('saving', item)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
          <TotalRow
            accent="text-blue-700"
            label="Total saved / month"
            value={currency(totals.totalSavings)}
          />
        </Card>

        <Card
          action={
            <Button onClick={() => openModal('goal')} type="button" variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add goal
            </Button>
          }
          title="Financial goals"
        >
          <div className="grid gap-5">
            {data.goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals yet.</p>
            ) : null}
            {data.goals.map((goal) => (
              <article key={goal.id}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                  <RowActions
                    onDelete={() => deleteItem('goal', goal.id)}
                    onEdit={() => openModal('goal', goal)}
                  />
                </div>
                <ProgressBar
                  max={goal.target}
                  sublabel={`${currency(goal.current)} of ${currency(goal.target)} - ${percent(goal.current, goal.target)}%`}
                  value={goal.current}
                />
              </article>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
