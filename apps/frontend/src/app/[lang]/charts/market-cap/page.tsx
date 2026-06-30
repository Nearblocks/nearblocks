import type { Metadata } from 'next';

import { MarketCapChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchPriceStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/market-cap'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/market-cap' },
    description: t('marketCap.meta.description'),
    title: t('marketCap.meta.title'),
  };
};

const MarketCapPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchPriceStats();

  return (
    <>
      <PageHeading apiTag="" title={t('marketCap.heading')} />
      <ErrorSuspense fallback={<MarketCapChart loading />}>
        <MarketCapChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default MarketCapPage;
