import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MultichainTxns } from '@/components/multichain';
import { fetchMCStats, fetchMCTxns } from '@/data/multichain-txns';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/multichain-txns'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'multichain');

  return {
    alternates: { canonical: '/multichain-txns' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const MultichainTxnsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'multichain');
  const filters = await searchParams;
  const txnsPromise = fetchMCTxns(filters);
  const mcStatsPromise = fetchMCStats();

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('title')}</h1>
      <ErrorSuspense fallback={<MultichainTxns loading />}>
        <MultichainTxns
          mcStatsPromise={mcStatsPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default MultichainTxnsPage;
