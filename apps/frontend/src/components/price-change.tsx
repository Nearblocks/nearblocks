'use client';

import { numberFormat, NumberFormat } from '@/lib/format';
import { cn } from '@/lib/utils';

type Props = {
  change: NumberFormat;
} & React.HTMLAttributes<HTMLSpanElement>;

export const PriceChange = ({ change, className, ...props }: Props) => {
  if (change === undefined || change === null) return null;

  const changeNumber = typeof change === 'bigint' ? change : +change;

  if (changeNumber < 0) {
    return (
      <span className={cn('text-body-xs text-red-500', className)} {...props}>
        ({numberFormat(changeNumber, { maximumFractionDigits: 2 })}%)
      </span>
    );
  }

  return (
    <span className={cn('text-body-xs text-green-500', className)} {...props}>
      (+{numberFormat(changeNumber, { maximumFractionDigits: 2 })}%)
    </span>
  );
};
