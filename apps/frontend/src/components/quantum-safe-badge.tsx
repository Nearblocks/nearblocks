'use client';

import { ShieldCheck } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';
import { cn, isQuantumSafeKey } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  className?: string;
  publicKey?: null | string;
};

export const QuantumSafeBadge = ({ className, publicKey }: Props) => {
  const { t } = useLocale('layout');

  if (!isQuantumSafeKey(publicKey)) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ShieldCheck
          className={cn('text-lime-foreground size-3.5 shrink-0', className)}
        />
      </TooltipTrigger>
      <TooltipContent>{t('quantumSafeKey')}</TooltipContent>
    </Tooltip>
  );
};
