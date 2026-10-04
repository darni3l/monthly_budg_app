export const currency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

export const currencyExact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// Not capped at 100: some callers (e.g. a goal exceeding its target, or a
// pace projection) need the true percentage. Callers that render this as a
// bar width can safely exceed 100 — an overflow-hidden container clips it
// visually the same way a cap would, without lying about the underlying number.
export const percent = (value: number, max: number) =>
  max === 0 ? 0 : Math.round((value / max) * 100);
