import type { Metadata } from 'next';

import { MetaTxnsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchAddressStats, fetchTxnStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/meta-txns'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/meta-txns' },
    description: t('metaTxns.meta.description'),
    title: t('metaTxns.meta.title'),
  };
};

const MetaTxnsChartPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const txnStatsPromise = fetchTxnStats();
  const addressStatsPromise = fetchAddressStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('metaTxns.heading')} />
      <ErrorSuspense fallback={<MetaTxnsChart loading />}>
        <MetaTxnsChart
          addressStatsPromise={addressStatsPromise}
          txnStatsPromise={txnStatsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default MetaTxnsChartPage;
