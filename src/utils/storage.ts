import { defaultBudgetData, STORAGE_KEY } from '../constants';
import type { BudgetData, Metadata } from '../types';

const cloneDefaults = () => structuredClone(defaultBudgetData);

function getCurrentMetadata(): Metadata {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

function normalizeBudgetData(raw: Partial<BudgetData> | null | undefined): BudgetData {
  const defaults = cloneDefaults();
  const parsed = raw ?? {};
  const metadata = parsed.metadata
    ? { month: parsed.metadata.month, year: parsed.metadata.year }
    : getCurrentMetadata();

  return {
    ...defaults,
    ...parsed,
    metadata,
    income: parsed.income ?? defaults.income,
    expenses: parsed.expenses ?? defaults.expenses,
    savings: parsed.savings ?? defaults.savings,
    goals: parsed.goals ?? defaults.goals,
    subscriptions: parsed.subscriptions ?? defaults.subscriptions,
    history: Array.isArray(parsed.history) ? parsed.history.slice(0, 12) : defaults.history,
    categoryBudgets: parsed.categoryBudgets ?? defaults.categoryBudgets,
    plans: Array.isArray(parsed.plans) ? parsed.plans.slice(0, 24) : defaults.plans,
  };
}

export function loadBudgetData(): BudgetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeBudgetData(parsed);
  } catch {
    return cloneDefaults();
  }
}

export function saveBudgetData(data: BudgetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
