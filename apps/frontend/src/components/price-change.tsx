'use client';

import { IoCaretDownCircle, IoCaretUpCircle } from 'react-icons/io5';

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
        <IoCaretDownCircle />
        {numberFormat(changeNumber, { maximumFractionDigits: 2 })}%
      </Badge>
    );
  }

  return (
    <Badge className={cn('h-6', className)} variant="lime" {...props}>
      <IoCaretUpCircle />+
      {numberFormat(changeNumber, { maximumFractionDigits: 2 })}%
    </Badge>
  );
};
