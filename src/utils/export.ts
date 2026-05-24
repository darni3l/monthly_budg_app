import { categoryLabels } from '../constants';
import type { BudgetData } from '../types';
import { currency, percent } from './format';

const dash = '-';

const escapeCsv = (value: string | number) => {
  const text = String(value);
  return text.includes(',') || text.includes('"') ? `"${text.replace(/"/g, '""')}"` : text;
};

export function exportCSV(data: BudgetData) {
  const rows = [['Section', 'Name', 'Category', 'Amount', 'Limit/Target']];

  data.income.forEach((item) =>
    rows.push(['Income', item.name, dash, String(item.amount), item.frequency]),
  );
  data.expenses.forEach((item) =>
    rows.push([
      'Expense',
      item.name,
      categoryLabels[item.category],
      String(item.amount),
      item.limit ? String(item.limit) : dash,
    ]),
  );
  data.savings.forEach((item) =>
    rows.push(['Savings', item.name, dash, String(item.amount), dash]),
  );
  data.goals.forEach((item) =>
    rows.push(['Goal', item.name, dash, String(item.current), String(item.target)]),
  );
  data.subscriptions.forEach((item) =>
    rows.push(['Subscription', item.name, dash, String(item.amount), item.renewal]),
  );

  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(data: BudgetData) {
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) return;

  const income = data.income.reduce((sum, item) => sum + item.amount, 0);
  const expenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const savings = data.savings.reduce((sum, item) => sum + item.amount, 0);
  const remaining = income - expenses - savings;

  popup.document.write(`<!doctype html><html><head><title>Budget Summary</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:2rem;color:#172033;max-width:760px;margin:0 auto}
      h1{font-size:28px;margin:0 0 .25rem} p{color:#64748b;margin:0 0 1.5rem}
      .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin-bottom:2rem}
      .card{border:1px solid #e2e8f0;border-radius:8px;padding:1rem;background:#f8fafc}
      .card strong{display:block;color:#64748b;font-size:12px;text-transform:uppercase}
      .card span{font-size:22px;font-weight:800}
      table{border-collapse:collapse;width:100%;font-size:13px;margin-bottom:1.5rem}
      th{text-align:left;background:#f1f5f9;color:#475569;font-size:11px;text-transform:uppercase}
      th,td{padding:9px 12px;border-bottom:1px solid #e2e8f0}
    </style></head><body>
    <h1>Monthly Budget Summary</h1>
    <p>${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
    <div class="grid">
      <div class="card"><strong>Income</strong><span>${currency(income)}</span></div>
      <div class="card"><strong>Expenses</strong><span>${currency(expenses)}</span></div>
      <div class="card"><strong>Savings</strong><span>${currency(savings)}</span></div>
      <div class="card"><strong>Remaining</strong><span>${currency(remaining)}</span></div>
    </div>
    <h2>Income</h2><table><tr><th>Source</th><th>Amount</th><th>Frequency</th></tr>
    ${data.income.map((item) => `<tr><td>${item.name}</td><td>${currency(item.amount)}</td><td>${item.frequency}</td></tr>`).join('')}</table>
    <h2>Expenses</h2><table><tr><th>Name</th><th>Category</th><th>Amount</th><th>Limit</th></tr>
    ${data.expenses.map((item) => `<tr><td>${item.name}</td><td>${categoryLabels[item.category]}</td><td>${currency(item.amount)}</td><td>${item.limit ? currency(item.limit) : dash}</td></tr>`).join('')}</table>
    <h2>Goals</h2><table><tr><th>Goal</th><th>Current</th><th>Target</th><th>Progress</th></tr>
    ${data.goals.map((item) => `<tr><td>${item.name}</td><td>${currency(item.current)}</td><td>${currency(item.target)}</td><td>${percent(item.current, item.target)}%</td></tr>`).join('')}</table>
    <script>window.print();</script></body></html>`);
  popup.document.close();
}
