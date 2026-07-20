import type { Metadata } from 'next';

import { FTTxns } from '@/components/address/fts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { TokenTransfers } from '@/components/tokens/transfers';
import {
  fetchFTTxnCount as fetchAddressFTTxnCount,
  fetchFTTxns as fetchAddressFTTxns,
} from '@/data/address/fts';
import { fetchFTTxnCount, fetchFTTxns } from '@/data/tokens';
import { holdNav } from '@/lib/hold-nav';
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
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;

  if (account) {
    const ftsPromise = fetchAddressFTTxns(account, filters);
    const ftCountPromise = fetchAddressFTTxnCount(account, filters);
    await holdNav();

    return (
      <>
        <PageHeading apiTag="fts" title={t('transfers.title')} />
        <ErrorSuspense fallback={<FTTxns loading />}>
          <FTTxns
            address={account}
            basePath="/tokens/transfers"
            ftCountPromise={ftCountPromise}
            ftsPromise={ftsPromise}
          />
        </ErrorSuspense>
      </>
    );
  }

  const txnsPromise = fetchFTTxns(filters);
  const txnCountPromise = fetchFTTxnCount(filters);
  await holdNav();

  return (
    <>
      <PageHeading apiTag="fts" title={t('transfers.title')} />
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
