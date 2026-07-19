import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MultichainTxns } from '@/components/multichain';
import { PageHeading } from '@/components/page-heading';
import {
  fetchMCStats,
  fetchMCTxnCount,
  fetchMCTxns,
} from '@/data/multichain-txns';
import { holdNav } from '@/lib/hold-nav';
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
  const txnCountPromise = fetchMCTxnCount(filters);
  const mcStatsPromise = fetchMCStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="multichain" title={t('title')} />
      <ErrorSuspense fallback={<MultichainTxns loading />}>
        <MultichainTxns
          mcStatsPromise={mcStatsPromise}
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default MultichainTxnsPage;
