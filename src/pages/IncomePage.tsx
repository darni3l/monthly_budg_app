import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RowActions } from '../components/RowActions';
import { SectionHeader } from '../components/SectionHeader';
import { Table, TableWrap, Td, Th, TotalRow } from '../components/Table';
import { currency } from '../utils/format';
import { useBudgetContext } from './useBudgetContext';

export function IncomePage() {
  const {
    budget: { data, totals, deleteItem },
    openModal,
  } = useBudgetContext();

  return (
    <>
      <SectionHeader
        action={
          <Button onClick={() => openModal('income')} type="button" variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add income
          </Button>
        }
        subtitle="Track all recurring income streams."
        title="Income sources"
      />
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Source</Th>
                <Th>Amount</Th>
                <Th>Frequency</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {data.income.map((item) => (
                <tr className="transition hover:bg-slate-50" key={item.id}>
                  <Td className="font-semibold">{item.name}</Td>
                  <Td className="font-mono font-bold text-emerald-700">{currency(item.amount)}</Td>
                  <Td className="capitalize text-slate-500">{item.frequency}</Td>
                  <Td>
                    <RowActions
                      onDelete={() => deleteItem('income', item.id)}
                      onEdit={() => openModal('income', item)}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
        <TotalRow
          accent="text-emerald-700"
          label="Total monthly income"
          value={currency(totals.totalIncome)}
        />
      </Card>
    </>
  );
}
