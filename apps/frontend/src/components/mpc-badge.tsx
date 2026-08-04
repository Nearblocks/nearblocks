'use client';

import { Bot } from 'lucide-react';

import { AccountKey } from 'nb-schemas';

import { Link } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  className?: string;
  mpc?: AccountKey['mpc'];
};

export const MpcBadge = ({ className, mpc }: Props) => {
  const { t } = useLocale('address');

  if (!mpc) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Bot
          className={cn('text-blue-foreground size-3.5 shrink-0', className)}
        />
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-1">
        {t('keys.mpcKey')}
        <Link className="text-link" href={`/address/${mpc.account_id}`}>
          {mpc.account_id}
        </Link>
      </TooltipContent>
    </Tooltip>
  );
};
