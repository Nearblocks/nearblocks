import { Metadata } from 'next';

import { Charts } from '@/components/charts';
import { PageHeading } from '@/components/page-heading';
import {
  fetchAddressStats,
  fetchBlockStats,
  fetchPriceStats,
  fetchTpsStats,
  fetchTxnStats,
} from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ChartsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const blockStatsPromise = fetchBlockStats(14);
  const txnStatsPromise = fetchTxnStats(14);
  const addressStatsPromise = fetchAddressStats(14);
  const priceStatsPromise = fetchPriceStats(14);
  const tpsStatsPromise = fetchTpsStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('title')} />
      <Charts
        addressStatsPromise={addressStatsPromise}
        blockStatsPromise={blockStatsPromise}
        priceStatsPromise={priceStatsPromise}
        tpsStatsPromise={tpsStatsPromise}
        txnStatsPromise={txnStatsPromise}
      />
    </>
  );
};

export default ChartsPage;
