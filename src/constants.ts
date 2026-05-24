import type { BudgetData, Category } from './types';

export const STORAGE_KEY = 'budgetly_v2';

export const categoryLabels: Record<Category, string> = {
  fixed: 'Fixed',
  variable: 'Variable',
  savings: 'Savings',
  debt: 'Debt',
  subscription: 'Subscription',
};

export const categoryColors: Record<Category, string> = {
  fixed: '#2563eb',
  variable: '#d97706',
  savings: '#059669',
  debt: '#dc2626',
  subscription: '#7c3aed',
};

export const categoryBadgeClasses: Record<Category, string> = {
  fixed: 'bg-blue-50 text-blue-700 ring-blue-200',
  variable: 'bg-amber-50 text-amber-800 ring-amber-200',
  savings: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  debt: 'bg-rose-50 text-rose-700 ring-rose-200',
  subscription: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const defaultBudgetData: BudgetData = {
  income: [
    { id: 1, name: 'Primary salary', amount: 4200, frequency: 'monthly' },
    { id: 2, name: 'Freelance design', amount: 600, frequency: 'monthly' },
    { id: 3, name: 'Dividend income', amount: 80, frequency: 'monthly' },
  ],
  expenses: [
    { id: 1, name: 'Rent', category: 'fixed', amount: 1200, limit: 1200 },
    { id: 2, name: 'Car insurance', category: 'fixed', amount: 95, limit: 100 },
    { id: 3, name: 'Phone bill', category: 'fixed', amount: 45, limit: 50 },
    { id: 4, name: 'Groceries', category: 'variable', amount: 340, limit: 300 },
    { id: 5, name: 'Dining out', category: 'variable', amount: 180, limit: 150 },
    { id: 6, name: 'Gas & transport', category: 'variable', amount: 90, limit: 100 },
    { id: 7, name: 'Entertainment', category: 'variable', amount: 65, limit: 60 },
    { id: 8, name: 'Student loan', category: 'debt', amount: 320, limit: 320 },
    { id: 9, name: 'Credit card', category: 'debt', amount: 150, limit: 200 },
  ],
  savings: [
    { id: 1, name: 'Emergency fund', amount: 300 },
    { id: 2, name: 'Retirement (401k)', amount: 420 },
    { id: 3, name: 'Vacation fund', amount: 100 },
  ],
  goals: [
    { id: 1, name: 'Emergency fund (3 months)', target: 12600, current: 4800 },
    { id: 2, name: 'New car down payment', target: 8000, current: 2200 },
    { id: 3, name: 'Europe vacation', target: 3500, current: 1400 },
  ],
  subscriptions: [
    { id: 1, name: 'Netflix', amount: 15.99, renewal: 'Monthly' },
    { id: 2, name: 'Spotify', amount: 9.99, renewal: 'Monthly' },
    { id: 3, name: 'Adobe CC', amount: 54.99, renewal: 'Monthly' },
    { id: 4, name: 'iCloud', amount: 2.99, renewal: 'Monthly' },
    { id: 5, name: 'ChatGPT Plus', amount: 20, renewal: 'Monthly' },
  ],
};
