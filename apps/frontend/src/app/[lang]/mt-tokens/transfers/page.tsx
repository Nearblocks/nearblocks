import type { Metadata } from 'next';

import { MTTxns as AddressMTTxns } from '@/components/address/mts';
import { ErrorSuspense } from '@/components/error-suspense';
import { MtTokenTransfers } from '@/components/mt-tokens/transfers';
import {
  fetchMTTxnCount as fetchAddressMTTxnCount,
  fetchMTTxns as fetchAddressMTTxns,
} from '@/data/address/mts';
import { fetchMTTxnCount, fetchMTTxns } from '@/data/mt-tokens';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/mt-tokens/transfers'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return {
    alternates: { canonical: '/mt-tokens/transfers' },
    description: t('transfersMeta.description'),
    title: t('transfersMeta.title'),
  };
};

const MtTransfersPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');
  const filters = await searchParams;
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;

  if (account) {
    const mtsPromise = fetchAddressMTTxns(account, filters);
    const mtCountPromise = fetchAddressMTTxnCount(account, filters);

    return (
      <>
        <h1 className="text-headline-lg mb-4">{t('transfers.heading')}</h1>
        <ErrorSuspense fallback={<AddressMTTxns loading />}>
          <AddressMTTxns
            address={account}
            basePath="/mt-tokens/transfers"
            mtCountPromise={mtCountPromise}
            mtsPromise={mtsPromise}
          />
        </ErrorSuspense>
      </>
    );
  }

  const txnsPromise = fetchMTTxns(filters);
  const txnCountPromise = fetchMTTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('transfers.heading')}</h1>
      <ErrorSuspense fallback={<MtTokenTransfers loading />}>
        <MtTokenTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default MtTransfersPage;
