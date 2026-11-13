'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';

import type { BillingInterval } from './pricing';

type Props = {
  onChange: (interval: BillingInterval) => void;
  saving: { best: number; uniform: boolean };
  value: BillingInterval;
};

const itemClass =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-body-sm whitespace-nowrap sm:gap-2 sm:px-4 font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground';

export const BillingToggle = ({ onChange, saving, value }: Props) => {
  const { t } = useLocale('apis');

  return (
    <RadioGroupPrimitive.Root
      aria-label={t('pricing.billing')}
      className="inline-flex max-w-full items-center gap-1 rounded-lg border bg-card p-1 shadow-xs"
      onValueChange={(next) => onChange(next as BillingInterval)}
      orientation="horizontal"
      value={value}
    >
      <RadioGroupPrimitive.Item className={itemClass} value="month">
        {t('pricing.monthly')}
      </RadioGroupPrimitive.Item>
      <RadioGroupPrimitive.Item className={itemClass} value="year">
        {t('pricing.annually')}
        {saving.best > 0 && (
          <Badge
            className={cn(
              'px-1.5 text-body-xs',
              value === 'year' && 'bg-primary-foreground/15 text-inherit',
            )}
            variant="lime"
          >
            {t(saving.uniform ? 'pricing.save' : 'pricing.saveUpTo', {
              percent: saving.best,
            })}
          </Badge>
        )}
      </RadioGroupPrimitive.Item>
    </RadioGroupPrimitive.Root>
  );
};
