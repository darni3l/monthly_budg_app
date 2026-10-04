import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadBudgetData, saveBudgetData } from '../utils/storage';
import type {
  BudgetData,
  BudgetItem,
  BudgetSection,
  Category,
  ExpenseItem,
  GoalItem,
  IncomeItem,
  MonthlyPlan,
  SavingItem,
  SubscriptionItem,
} from '../types';

type SectionKey = 'income' | 'expenses' | 'savings' | 'goals' | 'subscriptions';

const sectionKey: Record<BudgetSection, SectionKey> = {
  income: 'income',
  expense: 'expenses',
  saving: 'savings',
  goal: 'goals',
  subscription: 'subscriptions',
};

function getPreviousMonth(month: number, year: number) {
  const prevDate = new Date(year, month - 1, 1);
  return { month: prevDate.getMonth(), year: prevDate.getFullYear() };
}

export function useBudgetData(initialData?: BudgetData) {
  const [data, setData] = useState<BudgetData>(() => initialData ?? loadBudgetData());

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

  const currentPlan = useMemo(
    () =>
      data.plans.find(
        (plan) => plan.month === data.metadata.month && plan.year === data.metadata.year,
      ),
    [data.plans, data.metadata],
  );

  const previousPlan = useMemo(() => {
    const prev = getPreviousMonth(data.metadata.month, data.metadata.year);
    return data.plans.find((plan) => plan.month === prev.month && plan.year === prev.year);
  }, [data.plans, data.metadata]);

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

  const importData = useCallback((next: BudgetData) => {
    setData(next);
  }, []);

  const setCategoryBudget = useCallback((category: Category, amount: number | null) => {
    setData((current) => {
      const nextCategoryBudgets = { ...current.categoryBudgets };
      if (amount === null || amount <= 0) {
        delete nextCategoryBudgets[category];
      } else {
        nextCategoryBudgets[category] = amount;
      }
      return { ...current, categoryBudgets: nextCategoryBudgets };
    });
  }, []);

  // Updates (or creates) the plan for the CURRENT month only — never a past
  // one, so editing this can never silently rewrite history. Partial fields
  // merge onto the existing plan; categoryAllocations merges key-by-key
  // rather than replacing the whole map, so saving one category's allocation
  // doesn't wipe out the others.
  const upsertPlan = useCallback(
    (fields: Partial<Pick<MonthlyPlan, 'plannedIncome' | 'categoryAllocations' | 'notes'>>) => {
      setData((current) => {
        const { month, year } = current.metadata;
        const existingIndex = current.plans.findIndex(
          (plan) => plan.month === month && plan.year === year,
        );
        const base: MonthlyPlan =
          existingIndex >= 0
            ? current.plans[existingIndex]
            : { month, year, plannedIncome: 0, categoryAllocations: {}, notes: '' };

        const updatedPlan: MonthlyPlan = {
          ...base,
          ...fields,
          categoryAllocations: fields.categoryAllocations
            ? { ...base.categoryAllocations, ...fields.categoryAllocations }
            : base.categoryAllocations,
        };

        const nextPlans =
          existingIndex >= 0
            ? current.plans.map((plan, index) => (index === existingIndex ? updatedPlan : plan))
            : [...current.plans, updatedPlan];

        return { ...current, plans: nextPlans };
      });
    },
    [],
  );

  // Copies last month's plan onto the current month. Reads `data` directly
  // (rather than inside the setData updater) so the overwrite confirmation
  // only ever fires once — a confirm() call inside a setState updater can
  // run twice under React 18 Strict Mode's dev-only double-invocation.
  const copyPreviousMonthPlan = useCallback(() => {
    const { month, year } = data.metadata;
    const prev = getPreviousMonth(month, year);
    const previous = data.plans.find((plan) => plan.month === prev.month && plan.year === prev.year);
    if (!previous) return;

    const hasExisting = data.plans.some((plan) => plan.month === month && plan.year === year);
    if (hasExisting && !window.confirm("Replace this month's plan with last month's plan?")) {
      return;
    }

    setData((current) => {
      const existingIndex = current.plans.findIndex(
        (plan) => plan.month === month && plan.year === year,
      );
      const copied: MonthlyPlan = {
        month,
        year,
        plannedIncome: previous.plannedIncome,
        categoryAllocations: { ...previous.categoryAllocations },
        notes: previous.notes,
      };
      const nextPlans =
        existingIndex >= 0
          ? current.plans.map((plan, index) => (index === existingIndex ? copied : plan))
          : [...current.plans, copied];
      return { ...current, plans: nextPlans };
    });
  }, [data.metadata, data.plans]);

  return {
    data,
    totals,
    overBudget,
    currentPlan,
    previousPlan,
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
    importData,
    setCategoryBudget,
    upsertPlan,
    copyPreviousMonthPlan,
  };
}
