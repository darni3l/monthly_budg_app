export type PaceStatus = 'early' | 'on-track' | 'over-pace';

export interface PaceResult {
  status: PaceStatus;
  label: string;
  /** How much of the limit you'd expect to have spent by today, at an even daily rate. */
  expectedByNow: number;
  /** Projected end-of-month total if spending continues at the current daily rate. */
  projected: number;
}

// Below 85% of the expected-by-now amount: spending less than a linear pace would predict.
const EARLY_THRESHOLD = 0.85;
// Above 115% of the expected-by-now amount: spending faster than a linear pace would predict.
const OVER_THRESHOLD = 1.15;

export function getMonthProgress(referenceDate: Date = new Date()) {
  const currentDay = referenceDate.getDate();
  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0,
  ).getDate();

  return { currentDay, daysInMonth, fraction: daysInMonth > 0 ? currentDay / daysInMonth : 0 };
}

/**
 * Compares actual spending so far this month against a simple linear pace
 * toward a monthly limit. Returns null when there's no limit to pace
 * against — pacing is meaningless without one.
 */
export function getSpendingPace(
  amount: number,
  limit: number,
  referenceDate: Date = new Date(),
): PaceResult | null {
  if (limit <= 0) return null;

  const { fraction } = getMonthProgress(referenceDate);
  const expectedByNow = limit * fraction;
  const projected = fraction > 0 ? amount / fraction : amount;
  const ratio = expectedByNow > 0 ? amount / expectedByNow : amount > 0 ? Infinity : 0;

  if (ratio < EARLY_THRESHOLD) {
    return { status: 'early', label: 'Ahead of pace', expectedByNow, projected };
  }
  if (ratio > OVER_THRESHOLD) {
    return { status: 'over-pace', label: 'Spending too fast', expectedByNow, projected };
  }
  return { status: 'on-track', label: 'On track', expectedByNow, projected };
}
