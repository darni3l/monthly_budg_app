import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { categoryColors, categoryLabels, months } from '../constants';
import { Card } from '../components/Card';
import { MetricCard } from '../components/MetricCard';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeader } from '../components/SectionHeader';
import type { Category } from '../types';
import { currency } from '../utils/format';
import { useBudgetContext } from './useBudgetContext';

export function DashboardPage() {
  const {
    budget: { data, totals },
  } = useBudgetContext();

  const categoryTotals = (Object.keys(categoryLabels) as Category[]).map((category) => {
    const expenseTotal = data.expenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
    const subscriptionTotal =
      category === 'subscription'
        ? data.subscriptions.reduce((sum, item) => sum + item.amount, 0)
        : 0;
    return { category, value: expenseTotal + subscriptionTotal };
  });

  const pieData = categoryTotals
    .filter((item) => item.value > 0)
    .map((item) => ({
      name: categoryLabels[item.category],
      value: Math.round(item.value),
      color: categoryColors[item.category],
    }));

  const barData = months.map((month, index) => ({
    month,
    Income: Math.round(totals.totalIncome * (0.96 + index * 0.006)),
    Expenses: Math.round(totals.totalExpenses * (0.78 + index * 0.04)),
  }));

  return (
    <>
      <SectionHeader title="Dashboard" subtitle="Your monthly financial overview" />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total income"
          value={currency(totals.totalIncome)}
          sub="This month"
          tone="green"
        />
        <MetricCard
          label="Total expenses"
          value={currency(totals.totalExpenses)}
          sub={`${data.expenses.length} items`}
        />
        <MetricCard
          label="Saved"
          value={currency(totals.totalSavings)}
          sub={`${totals.savingsRate}% savings rate`}
          tone="blue"
        />
        <MetricCard
          label="Remaining"
          value={currency(totals.remaining)}
          sub={totals.remaining < 0 ? 'Over budget' : 'Available'}
          tone={totals.remaining < 0 ? 'red' : 'green'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Spending by category">
          <div className="mb-3 flex flex-wrap gap-3">
            {pieData.map((item) => (
              <span className="flex items-center gap-2 text-xs text-slate-500" key={item.name}>
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.name} {currency(item.value)}
              </span>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={pieData}
                  dataKey="value"
                  innerRadius={48}
                  outerRadius={82}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Budget vs actual">
          {(Object.keys(categoryLabels) as Category[]).map((category) => {
            const actual = data.expenses
              .filter((item) => item.category === category)
              .reduce((sum, item) => sum + item.amount, 0);
            const limit = data.expenses
              .filter((item) => item.category === category)
              .reduce((sum, item) => sum + (item.limit || 0), 0);

            if (actual === 0 && limit === 0) return null;
            return (
              <ProgressBar
                key={category}
                label={categoryLabels[category]}
                max={limit || actual}
                sublabel={`${currency(actual)}${limit ? ` / ${currency(limit)}` : ''}`}
                value={actual}
              />
            );
          })}
        </Card>
      </div>

      <Card className="mt-4" title="Income vs expenses - last 6 months">
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart barGap={4} data={barData}>
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
                tickFormatter={(value) => `€${(Number(value) / 1000).toFixed(0)}k`}
                tickLine={false}
              />
              <Tooltip formatter={(value) => currency(Number(value))} />
              <Legend />
              <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
