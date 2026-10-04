import { useOutletContext } from 'react-router-dom';
import type { BudgetOutletContext } from '../App';

export function useBudgetContext() {
  return useOutletContext<BudgetOutletContext>();
}
