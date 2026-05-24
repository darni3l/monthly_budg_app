import { categoryBadgeClasses, categoryLabels } from '../constants';
import type { Category } from '../types';

export function Badge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${categoryBadgeClasses[category]}`}
    >
      {categoryLabels[category]}
    </span>
  );
}
