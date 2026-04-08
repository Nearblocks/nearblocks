import type { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenTransfers } from '@/components/nft-tokens/transfers';
import { fetchNFTTxnCount, fetchNFTTxns } from '@/data/nft-tokens';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/nft-tokens/transfers'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');

  return {
    alternates: { canonical: '/nft-tokens/transfers' },
    description: t('transfersMeta.description'),
    title: t('transfersMeta.title'),
  };
};

const NftTransfersPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');
  const filters = await searchParams;
  const txnsPromise = fetchNFTTxns(filters);
  const txnCountPromise = fetchNFTTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('transfers.heading')}</h1>
      <ErrorSuspense fallback={<NftTokenTransfers loading />}>
        <NftTokenTransfers
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NftTransfersPage;
