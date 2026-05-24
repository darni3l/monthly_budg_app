import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadBudgetData, saveBudgetData } from '../utils/storage';
import type {
  BudgetData,
  BudgetItem,
  BudgetSection,
  ExpenseItem,
  GoalItem,
  IncomeItem,
  SavingItem,
  SubscriptionItem,
} from '../types';

type SectionKey = keyof BudgetData;

const sectionKey: Record<BudgetSection, SectionKey> = {
  income: 'income',
  expense: 'expenses',
  saving: 'savings',
  goal: 'goals',
  subscription: 'subscriptions',
};

export function useBudgetData() {
  const [data, setData] = useState<BudgetData>(loadBudgetData);

  useEffect(() => {
    saveBudgetData(data);
  }, [data]);

  const totals = useMemo(() => {
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = data.savings.reduce((sum, item) => sum + item.amount, 0);
    const totalSubscriptions = data.subscriptions.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalIncome - totalExpenses - totalSavings;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      totalSubscriptions,
      remaining,
      savingsRate: totalIncome === 0 ? 0 : Math.round((totalSavings / totalIncome) * 100),
    };
  }, [data]);

  const overBudget = useMemo(
    () => data.expenses.filter((item) => item.limit > 0 && item.amount > item.limit),
    [data.expenses],
  );

  const addItem = useCallback((section: BudgetSection, item: Omit<BudgetItem, 'id'>) => {
    const key = sectionKey[section];
    setData((current) => ({
      ...current,
      [key]: [...current[key], { ...item, id: Date.now() }],
    }));
  }, []);

  const updateItem = useCallback((section: BudgetSection, item: BudgetItem) => {
    const key = sectionKey[section];
    setData((current) => ({
      ...current,
      [key]: current[key].map((entry) => (entry.id === item.id ? item : entry)),
    }));
  }, []);

  const deleteItem = useCallback((section: BudgetSection, id: number) => {
    if (!window.confirm('Delete this item?')) return;
    const key = sectionKey[section];
    setData((current) => ({
      ...current,
      [key]: current[key].filter((entry) => entry.id !== id),
    }));
  }, []);

  const resetData = useCallback(() => {
    if (!window.confirm('Reset the budget tracker to sample data?')) return;
    localStorage.removeItem('budgetly_v2');
    setData(loadBudgetData());
  }, []);

  return {
    data,
    totals,
    overBudget,
    addItem: addItem as {
      (section: 'income', item: Omit<IncomeItem, 'id'>): void;
      (section: 'expense', item: Omit<ExpenseItem, 'id'>): void;
      (section: 'saving', item: Omit<SavingItem, 'id'>): void;
      (section: 'goal', item: Omit<GoalItem, 'id'>): void;
      (section: 'subscription', item: Omit<SubscriptionItem, 'id'>): void;
    },
    updateItem,
    deleteItem,
    resetData,
  };
}
