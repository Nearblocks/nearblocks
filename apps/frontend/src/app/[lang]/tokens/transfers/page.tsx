import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { TokenTransfers } from '@/components/tokens/transfers';
import { fetchFTTxnCount, fetchFTTxns } from '@/data/tokens';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/tokens/transfers'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');
  return {
    alternates: { canonical: '/tokens/transfers' },
    description: t('transfersMeta.description'),
    title: t('transfersMeta.title'),
  };
};

const TransfersPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');
  const filters = await searchParams;
  const txnsPromise = fetchFTTxns(filters);
  const txnCountPromise = fetchFTTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('transfers.title')}</h1>
      <ErrorSuspense fallback={<TokenTransfers loading />}>
        <TokenTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TransfersPage;
