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

export interface BudgetData {
  income: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingItem[];
  goals: GoalItem[];
  subscriptions: SubscriptionItem[];
}

export type BudgetItem = IncomeItem | ExpenseItem | SavingItem | GoalItem | SubscriptionItem;
export type BudgetSection = 'income' | 'expense' | 'saving' | 'goal' | 'subscription';
export type TabRoute = '/' | '/income' | '/expenses' | '/goals' | '/trends';
