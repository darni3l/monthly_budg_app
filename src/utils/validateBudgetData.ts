import type {
  BudgetData,
  Category,
  ExpenseItem,
  Frequency,
  GoalItem,
  IncomeItem,
  Metadata,
  MonthlyPlan,
  MonthSnapshot,
  Renewal,
  SavingItem,
  SubscriptionItem,
} from '../types';

const CATEGORIES: Category[] = ['fixed', 'variable', 'savings', 'debt', 'subscription'];
const FREQUENCIES: Frequency[] = ['monthly', 'bi-weekly', 'weekly', 'annual'];
const RENEWALS: Renewal[] = ['Monthly', 'Quarterly', 'Annual'];

export interface ImportSuccess {
  success: true;
  data: BudgetData;
  warnings: string[];
}

export interface ImportFailure {
  success: false;
  errors: string[];
}

export type ImportResult = ImportSuccess | ImportFailure;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOneOf<T extends string>(value: unknown, options: T[]): value is T {
  return typeof value === 'string' && (options as string[]).includes(value);
}

function validateMetadata(raw: unknown): Metadata | null {
  if (!isRecord(raw)) return null;
  const { month, year } = raw;
  if (!isFiniteNumber(month) || month < 0 || month > 11) return null;
  if (!isFiniteNumber(year) || year < 2000 || year > 2100) return null;
  return { month, year };
}

function validateIncomeItem(raw: unknown): IncomeItem | null {
  if (!isRecord(raw)) return null;
  const { id, name, amount, frequency } = raw;
  if (!isFiniteNumber(id)) return null;
  if (!isNonEmptyString(name)) return null;
  if (!isFiniteNumber(amount) || amount < 0) return null;
  if (!isOneOf(frequency, FREQUENCIES)) return null;
  return { id, name, amount, frequency };
}

function validateExpenseItem(raw: unknown): ExpenseItem | null {
  if (!isRecord(raw)) return null;
  const { id, name, category, amount, limit } = raw;
  if (!isFiniteNumber(id)) return null;
  if (!isNonEmptyString(name)) return null;
  if (!isOneOf(category, CATEGORIES)) return null;
  if (!isFiniteNumber(amount) || amount < 0) return null;
  if (!isFiniteNumber(limit) || limit < 0) return null;
  return { id, name, category, amount, limit };
}

function validateSavingItem(raw: unknown): SavingItem | null {
  if (!isRecord(raw)) return null;
  const { id, name, amount } = raw;
  if (!isFiniteNumber(id)) return null;
  if (!isNonEmptyString(name)) return null;
  if (!isFiniteNumber(amount) || amount < 0) return null;
  return { id, name, amount };
}

function validateGoalItem(raw: unknown): GoalItem | null {
  if (!isRecord(raw)) return null;
  const { id, name, target, current } = raw;
  if (!isFiniteNumber(id)) return null;
  if (!isNonEmptyString(name)) return null;
  if (!isFiniteNumber(target) || target < 0) return null;
  if (!isFiniteNumber(current) || current < 0) return null;
  return { id, name, target, current };
}

function validateSubscriptionItem(raw: unknown): SubscriptionItem | null {
  if (!isRecord(raw)) return null;
  const { id, name, amount, renewal } = raw;
  if (!isFiniteNumber(id)) return null;
  if (!isNonEmptyString(name)) return null;
  if (!isFiniteNumber(amount) || amount < 0) return null;
  if (!isOneOf(renewal, RENEWALS)) return null;
  return { id, name, amount, renewal };
}

function validateHistorySnapshot(raw: unknown): MonthSnapshot | null {
  if (!isRecord(raw)) return null;
  const { month, year, totalIncome, totalExpenses, totalSavings, remaining, expenseBreakdown } =
    raw;
  if (!isFiniteNumber(month) || month < 0 || month > 11) return null;
  if (!isFiniteNumber(year)) return null;
  if (!isFiniteNumber(totalIncome)) return null;
  if (!isFiniteNumber(totalExpenses)) return null;
  if (!isFiniteNumber(totalSavings)) return null;
  if (!isFiniteNumber(remaining)) return null;
  if (!Array.isArray(expenseBreakdown)) return null;

  const breakdown: MonthSnapshot['expenseBreakdown'] = [];
  for (const entry of expenseBreakdown) {
    if (!isRecord(entry)) continue;
    const { name, category, amount, limit } = entry;
    if (!isNonEmptyString(name)) continue;
    if (!isOneOf(category, CATEGORIES)) continue;
    if (!isFiniteNumber(amount)) continue;
    if (!isFiniteNumber(limit)) continue;
    breakdown.push({ name, category, amount, limit });
  }

  return { month, year, totalIncome, totalExpenses, totalSavings, remaining, expenseBreakdown: breakdown };
}

function validateCategoryAllocations(raw: unknown): Partial<Record<Category, number>> {
  if (!isRecord(raw)) return {};
  const result: Partial<Record<Category, number>> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isOneOf(key, CATEGORIES) && isFiniteNumber(value) && value >= 0) {
      result[key] = value;
    }
  }
  return result;
}

function validatePlan(raw: unknown): MonthlyPlan | null {
  if (!isRecord(raw)) return null;
  const { month, year, plannedIncome, categoryAllocations, notes } = raw;
  if (!isFiniteNumber(month) || month < 0 || month > 11) return null;
  if (!isFiniteNumber(year) || year < 2000 || year > 2100) return null;
  if (!isFiniteNumber(plannedIncome) || plannedIncome < 0) return null;

  return {
    month,
    year,
    plannedIncome,
    categoryAllocations: validateCategoryAllocations(categoryAllocations),
    notes: typeof notes === 'string' ? notes : '',
  };
}

function validateSection<T>(
  raw: unknown,
  label: string,
  validateItem: (item: unknown) => T | null,
  warnings: string[],
): T[] {
  if (!Array.isArray(raw)) {
    if (raw !== undefined) {
      warnings.push(`"${label}" was not a list and was reset to empty.`);
    }
    return [];
  }

  const result: T[] = [];
  let dropped = 0;

  raw.forEach((item) => {
    const validated = validateItem(item);
    if (validated) {
      result.push(validated);
    } else {
      dropped += 1;
    }
  });

  if (dropped > 0) {
    warnings.push(
      `${dropped} ${label} item${dropped > 1 ? 's' : ''} had an invalid format and ${
        dropped > 1 ? 'were' : 'was'
      } skipped.`,
    );
  }

  return result;
}

function validateCategoryBudgets(
  raw: unknown,
  warnings: string[],
): Partial<Record<Category, number>> {
  if (raw === undefined) return {};

  if (!isRecord(raw)) {
    warnings.push('"categoryBudgets" was not a valid object and was reset to empty.');
    return {};
  }

  const result: Partial<Record<Category, number>> = {};
  let dropped = 0;

  for (const [key, value] of Object.entries(raw)) {
    if (isOneOf(key, CATEGORIES) && isFiniteNumber(value) && value >= 0) {
      result[key] = value;
    } else {
      dropped += 1;
    }
  }

  if (dropped > 0) {
    warnings.push(
      `${dropped} category budget entr${dropped > 1 ? 'ies were' : 'y was'} invalid and skipped.`,
    );
  }

  return result;
}

export function parseAndValidateBackup(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { success: false, errors: ['That file is not valid JSON.'] };
  }

  if (!isRecord(parsed)) {
    return { success: false, errors: ['The backup file does not contain a budget data object.'] };
  }

  const warnings: string[] = [];

  let metadata = validateMetadata(parsed.metadata);
  if (!metadata) {
    const now = new Date();
    metadata = { month: now.getMonth(), year: now.getFullYear() };
    warnings.push('Missing or invalid month/year metadata — defaulted to the current month.');
  }

  const income = validateSection(parsed.income, 'income', validateIncomeItem, warnings);
  const expenses = validateSection(parsed.expenses, 'expense', validateExpenseItem, warnings);
  const savings = validateSection(parsed.savings, 'savings', validateSavingItem, warnings);
  const goals = validateSection(parsed.goals, 'goal', validateGoalItem, warnings);
  const subscriptions = validateSection(
    parsed.subscriptions,
    'subscription',
    validateSubscriptionItem,
    warnings,
  );
  const history = validateSection(parsed.history, 'history', validateHistorySnapshot, warnings).slice(
    0,
    12,
  );
  const categoryBudgets = validateCategoryBudgets(parsed.categoryBudgets, warnings);
  const plans = validateSection(parsed.plans, 'plan', validatePlan, warnings).slice(0, 24);

  if (
    income.length === 0 &&
    expenses.length === 0 &&
    savings.length === 0 &&
    goals.length === 0 &&
    subscriptions.length === 0
  ) {
    return {
      success: false,
      errors: [
        'No valid income, expenses, savings, goals, or subscriptions were found in this file — nothing to import.',
      ],
    };
  }

  return {
    success: true,
    data: {
      metadata,
      income,
      expenses,
      savings,
      goals,
      subscriptions,
      history,
      categoryBudgets,
      plans,
    },
    warnings,
  };
}
