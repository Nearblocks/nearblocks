import type { Metadata } from 'next';

import { TxnFeeChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchPriceStats, fetchTxnStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/txn-fee'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/txn-fee' },
    description: t('txnFee.meta.description'),
    title: t('txnFee.meta.title'),
  };
};

const TxnFeePage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const txnStatsPromise = fetchTxnStats();
  const priceStatsPromise = fetchPriceStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('txnFee.heading')} />
      <ErrorSuspense fallback={<TxnFeeChart loading />}>
        <TxnFeeChart
          priceStatsPromise={priceStatsPromise}
          txnStatsPromise={txnStatsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TxnFeePage;
