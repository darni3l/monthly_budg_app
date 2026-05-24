import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { RowActions } from '../components/RowActions';
import { SectionHeader } from '../components/SectionHeader';
import { Table, TableWrap, Td, Th, TotalRow } from '../components/Table';
import { months } from '../constants';
import { currency, currencyExact } from '../utils/format';
import { useBudgetContext } from './useBudgetContext';

export function TrendsPage() {
  const {
    budget: { data, totals, deleteItem },
    openModal,
  } = useBudgetContext();

  const trendData = months.map((month, index) => ({
    month,
    Spending: Math.round(totals.totalExpenses * (0.78 + index * 0.04)),
  }));

  return (
    <>
      <SectionHeader
        title="Trends & subscriptions"
        subtitle="Monitor spending movement and recurring costs."
      />
      <Card className="mb-4" title="Spending trend - last 6 months">
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="spendGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                axisLine={false}
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `€${(Number(value) / 1000).toFixed(1)}k`}
                tickLine={false}
              />
              <Tooltip formatter={(value) => currency(Number(value))} />
              <Area
                dataKey="Spending"
                dot={{ fill: '#2563eb', r: 4 }}
                fill="url(#spendGradient)"
                stroke="#2563eb"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        action={
          <Button onClick={() => openModal('subscription')} type="button" variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        }
        title="Subscription tracker"
      >
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Service</Th>
                <Th>Monthly cost</Th>
                <Th>Renewal</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {data.subscriptions.map((item) => (
                <tr className="transition hover:bg-slate-50" key={item.id}>
                  <Td className="font-semibold">{item.name}</Td>
                  <Td className="font-mono font-bold">{currencyExact(item.amount)}</Td>
                  <Td className="text-slate-500">{item.renewal}</Td>
                  <Td>
                    <RowActions
                      onDelete={() => deleteItem('subscription', item.id)}
                      onEdit={() => openModal('subscription', item)}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
        <TotalRow
          accent="text-violet-700"
          label="Total subscriptions / month"
          value={currencyExact(totals.totalSubscriptions)}
        />
      </Card>
    </>
  );
}
