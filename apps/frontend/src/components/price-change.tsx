'use client';

import { CircleChevronDown, CircleChevronUp } from 'lucide-react';

import { numberFormat, NumberFormat } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';

type Props = {
  change: NumberFormat;
} & React.HTMLAttributes<HTMLElement>;

export const PriceChange = ({ change, className, ...props }: Props) => {
  if (change === undefined || change === null) return null;

  const changeNumber = typeof change === 'bigint' ? change : +change;

  if (changeNumber < 0) {
    return (
      <Badge className={cn('h-6', className)} variant="red" {...props}>
        <CircleChevronDown />
        {numberFormat(changeNumber, { maximumFractionDigits: 2 })}%
      </Badge>
    );
  }

  return (
    <Badge className={cn('h-6', className)} variant="lime" {...props}>
      <CircleChevronUp />+
      {numberFormat(changeNumber, { maximumFractionDigits: 2 })}%
    </Badge>
  );
};
