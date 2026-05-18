import type { Metadata } from 'next';

import { TxnsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/txns'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/txns' },
    description: t('txns.meta.description'),
    title: t('txns.meta.title'),
  };
};

const TxnsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats();

  return (
    <>
      <PageHeading apiTag="" title={t('txns.heading')} />
      <ErrorSuspense fallback={<TxnsChart loading />}>
        <TxnsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnsPage;
