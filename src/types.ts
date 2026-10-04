export type Category = 'fixed' | 'variable' | 'savings' | 'debt' | 'subscription';
export type Frequency = 'monthly' | 'bi-weekly' | 'weekly' | 'annual';
export type Renewal = 'Monthly' | 'Quarterly' | 'Annual';

export interface IncomeItem {
  id: number;
  name: string;
  amount: number;
  frequency: Frequency;
}

export interface ExpenseItem {
  id: number;
  name: string;
  category: Category;
  amount: number;
  limit: number;
}

export interface SavingItem {
  id: number;
  name: string;
  amount: number;
}

export interface GoalItem {
  id: number;
  name: string;
  target: number;
  current: number;
}

export interface SubscriptionItem {
  id: number;
  name: string;
  amount: number;
  renewal: Renewal;
}

export interface Metadata {
  month: number;
  year: number;
}

export interface MonthSnapshot {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  remaining: number;
  expenseBreakdown: { name: string; category: Category; amount: number; limit: number }[];
}

export interface MonthlyPlan {
  month: number;
  year: number;
  plannedIncome: number;
  categoryAllocations: Partial<Record<Category, number>>;
  notes: string;
}

export interface BudgetData {
  metadata: Metadata;
  income: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingItem[];
  goals: GoalItem[];
  subscriptions: SubscriptionItem[];
  history: MonthSnapshot[];
  categoryBudgets: Partial<Record<Category, number>>;
  plans: MonthlyPlan[];
}

export type BudgetItem = IncomeItem | ExpenseItem | SavingItem | GoalItem | SubscriptionItem;
export type BudgetSection = 'income' | 'expense' | 'saving' | 'goal' | 'subscription';
export type TabRoute = '/' | '/income' | '/expenses' | '/goals' | '/trends' | '/planner';
