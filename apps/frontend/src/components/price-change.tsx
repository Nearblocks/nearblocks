'use client';

import { Triangle } from 'lucide-react';

import { numberFormat, NumberFormat } from '@/lib/format';
import { cn } from '@/lib/utils';

type Props = {
  change: NumberFormat;
} & React.HTMLAttributes<HTMLSpanElement>;

export const PriceChange = ({ change, className, ...props }: Props) => {
  if (change === undefined || change === null) return null;

  const changeNumber = typeof change === 'bigint' ? Number(change) : +change;

  // Anything that would display as 0.00% is neutral, including -0.004%.
  if (Math.abs(changeNumber) < 0.005) {
    return (
      <span className={cn('text-muted-foreground', className)} {...props}>
        0.00%
      </span>
    );
  }

  const up = changeNumber > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5',
        up
          ? 'text-green-600 dark:text-green-500'
          : 'text-red-600 dark:text-red-500',
        className,
      )}
      {...props}
    >
      <Triangle
        aria-hidden
        className={cn('size-2 shrink-0 fill-current', !up && 'rotate-180')}
      />
      {numberFormat(Math.abs(changeNumber), {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })}
      %
    </span>
  );
};

// Legacy compact format used in the topbar and home overview:
// "(+1.23%)" / "(-1.23%)" without carets.
export const PriceChangeText = ({ change, className, ...props }: Props) => {
  if (change === undefined || change === null) return null;

  const changeNumber = typeof change === 'bigint' ? Number(change) : +change;

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
