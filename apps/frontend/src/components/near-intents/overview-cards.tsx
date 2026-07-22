'use client';

import { use } from 'react';

import { IntentsOverview } from 'nb-schemas';

import { StatCard } from '@/components/stat-card';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, numberFormat } from '@/lib/format';

type Props = {
  loading?: boolean;
  overviewPromise?: Promise<IntentsOverview | null>;
};

export const OverviewCards = ({ loading, overviewPromise }: Props) => {
  const { t } = useLocale('mts');
  const overview = !loading && overviewPromise ? use(overviewPromise) : null;

  const lastDayVolume = overview?.prev_day_volume_usd ?? null;
  const lastDaySwaps = overview?.prev_day_swaps ?? null;
  const allTimeVolume = overview?.volume_usd ?? null;
  const allTimeSwaps = overview?.swaps ?? null;

  const statItems = [
    {
      href: '/charts/intents-volume',
      label: t('nearIntents.dashboard.cards.lastDayVolume'),
      value:
        lastDayVolume !== null
          ? currencyFormat(lastDayVolume, {
              maximumFractionDigits: 2,
              notation: 'compact',
            })
          : null,
    },
    {
      href: '/charts/intents-swaps',
      label: t('nearIntents.dashboard.cards.lastDaySwaps'),
      value:
        lastDaySwaps !== null
          ? numberFormat(lastDaySwaps, { notation: 'compact' })
          : null,
    },
    {
      href: '/charts/intents-volume',
      label: t('nearIntents.dashboard.cards.allTimeVolume'),
      value:
        allTimeVolume !== null
          ? currencyFormat(allTimeVolume, {
              maximumFractionDigits: 2,
              notation: 'compact',
            })
          : null,
    },
    {
      href: '/charts/intents-swaps',
      label: t('nearIntents.dashboard.cards.allTimeSwaps'),
      value:
        allTimeSwaps !== null
          ? numberFormat(allTimeSwaps, { notation: 'compact' })
          : null,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map(({ href, label, value }) => (
        <StatCard
          href={href}
          key={label}
          label={label}
          loading={!!loading}
          value={value ?? <span className="text-muted-foreground">N/A</span>}
        />
      ))}
    </div>
  );
};
