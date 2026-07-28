import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { IntentsAccountsChart } from '@/components/near-intents/accounts-chart';
import { IntentsBlockchainsChart } from '@/components/near-intents/blockchains-chart';
import { OverviewCards } from '@/components/near-intents/overview-cards';
import { IntentsSwapsChart } from '@/components/near-intents/swaps-chart';
import { IntentsTokensChart } from '@/components/near-intents/tokens-chart';
import { IntentsVolumeAssetsChart } from '@/components/near-intents/volume-assets-chart';
import { IntentsVolumeBlockchainChart } from '@/components/near-intents/volume-blockchain-chart';
import { IntentsVolumeChart } from '@/components/near-intents/volume-chart';
import { PageHeading } from '@/components/page-heading';
import {
  fetchIntentsAccountStats,
  fetchIntentsSwapStats,
  fetchIntentsVolumeStats,
} from '@/data/charts';
import {
  fetchIntentsAssetStats,
  fetchIntentsBlockchainCountStats,
  fetchIntentsBlockchainStats,
  fetchIntentsOverview,
  fetchIntentsTokenStats,
} from '@/data/near-intents';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/near-intents'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return {
    alternates: { canonical: '/near-intents' },
    description: t('nearIntents.dashboard.meta.description'),
    title: t('nearIntents.dashboard.meta.title'),
  };
};

const NearIntentsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  const overviewPromise = fetchIntentsOverview();
  const volumeStatsPromise = fetchIntentsVolumeStats(365);
  const swapStatsPromise = fetchIntentsSwapStats(365);
  const assetStatsPromise = fetchIntentsAssetStats(30);
  const blockchainStatsPromise = fetchIntentsBlockchainStats(30);
  const accountStatsPromise = fetchIntentsAccountStats(365);
  const tokenStatsPromise = fetchIntentsTokenStats(365);
  const blockchainCountStatsPromise = fetchIntentsBlockchainCountStats(365);
  await holdNav();

  return (
    <>
      <PageHeading
        apiTag="Intents"
        title={t('nearIntents.dashboard.heading')}
      />
      <ErrorSuspense fallback={<OverviewCards loading />}>
        <OverviewCards overviewPromise={overviewPromise} />
      </ErrorSuspense>
      <div className="grid grid-cols-1 gap-4">
        <ErrorSuspense fallback={<IntentsVolumeAssetsChart loading />}>
          <IntentsVolumeAssetsChart statsPromise={assetStatsPromise} />
        </ErrorSuspense>
        <ErrorSuspense fallback={<IntentsVolumeBlockchainChart loading />}>
          <IntentsVolumeBlockchainChart statsPromise={blockchainStatsPromise} />
        </ErrorSuspense>
        <ErrorSuspense fallback={<IntentsSwapsChart loading />}>
          <IntentsSwapsChart statsPromise={swapStatsPromise} />
        </ErrorSuspense>
        <ErrorSuspense fallback={<IntentsVolumeChart loading />}>
          <IntentsVolumeChart statsPromise={volumeStatsPromise} />
        </ErrorSuspense>
        <ErrorSuspense fallback={<IntentsAccountsChart loading />}>
          <IntentsAccountsChart statsPromise={accountStatsPromise} />
        </ErrorSuspense>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ErrorSuspense fallback={<IntentsBlockchainsChart loading />}>
          <IntentsBlockchainsChart statsPromise={blockchainCountStatsPromise} />
        </ErrorSuspense>
        <ErrorSuspense fallback={<IntentsTokensChart loading />}>
          <IntentsTokensChart statsPromise={tokenStatsPromise} />
        </ErrorSuspense>
      </div>
    </>
  );
};

export default NearIntentsPage;
