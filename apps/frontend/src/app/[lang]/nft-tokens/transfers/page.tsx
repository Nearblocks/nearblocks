import type { Metadata } from 'next';

import { NFTTxns } from '@/components/address/nfts';
import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenTransfers } from '@/components/nft-tokens/transfers';
import {
  fetchNFTTxnCount as fetchAddressNFTTxnCount,
  fetchNFTTxns as fetchAddressNFTTxns,
} from '@/data/address/nfts';
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
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;

  if (account) {
    const nftsPromise = fetchAddressNFTTxns(account, filters);
    const nftCountPromise = fetchAddressNFTTxnCount(account, filters);

    return (
      <>
        <h1 className="text-headline-lg mb-4">{t('transfers.heading')}</h1>
        <ErrorSuspense fallback={<NFTTxns loading />}>
          <NFTTxns
            address={account}
            basePath="/nft-tokens/transfers"
            nftCountPromise={nftCountPromise}
            nftsPromise={nftsPromise}
          />
        </ErrorSuspense>
      </>
    );
  }

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
