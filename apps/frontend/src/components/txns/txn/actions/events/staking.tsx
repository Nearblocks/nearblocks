'use client';

import { Coins } from 'lucide-react';

import { AccountLink } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat } from '@/lib/format';
import type { NearPrice } from '@/lib/txn';

import { NearFiat } from '../../near-fiat';
import type { StakingKind } from './utils';
import { parseStakingLogs } from './utils';

type Props = {
  contract: string;
  logs: unknown[];
  nearPrice?: NearPrice | null;
};

export const StakingEvents = ({ contract, logs, nearPrice }: Props) => {
  const { t } = useLocale('txns');
  const entries = parseStakingLogs(logs);

  if (entries.length === 0) return null;

  const label = (kind: StakingKind) => {
    switch (kind) {
      case 'deposit':
        return t('actions.deposit');
      case 'stake':
        return t('actions.stake');
      case 'unstake':
        return t('actions.unstake');
      case 'withdraw':
        return t('actions.withdraw');
    }
  };

  return (
    <>
      {entries.map((entry, i) => (
        <span
          className="flex flex-wrap items-center gap-1 text-body-sm"
          key={i}
        >
          <Coins className="size-3.5 shrink-0 text-blue-foreground" />
          {label(entry.kind)}
          <span className="flex items-center gap-1">
            <NearCircle className="size-4" />
            {nearFormat(entry.amount)}
            {Number(entry.amount) > 0 && (
              <NearFiat amount={entry.amount} price={nearPrice} />
            )}
          </span>
          {t('actions.by')}
          <AccountLink
            account={entry.account}
            textClassName="max-w-32 sm:max-w-40"
          />
          {t('actions.on')}
          <AccountLink
            account={contract}
            textClassName="max-w-32 sm:max-w-40"
          />
        </span>
      ))}
    </>
  );
};
