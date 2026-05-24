import { defaultBudgetData, STORAGE_KEY } from '../constants';
import type { BudgetData } from '../types';

const cloneDefaults = () => structuredClone(defaultBudgetData);

export function loadBudgetData(): BudgetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...cloneDefaults(), ...JSON.parse(raw) } : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function saveBudgetData(data: BudgetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
