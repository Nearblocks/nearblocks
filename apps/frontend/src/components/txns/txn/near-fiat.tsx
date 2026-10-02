'use client';

import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, nearFiatFormat } from '@/lib/format';
import type { NearPrice } from '@/lib/txn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  amount: string;
  price?: NearPrice | null;
};

export const NearFiat = ({ amount, price }: Props) => {
  const { t } = useLocale('txns');

  if (!price?.price) return null;

  const tip = price.closing
    ? t('overview.fiatTip', {
        date: price.date,
        price: currencyFormat(price.price),
      })
    : t('overview.fiatCurrentTip', { price: currencyFormat(price.price) });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help text-muted-foreground">
          ({nearFiatFormat(amount, price.price)})
        </span>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
};
