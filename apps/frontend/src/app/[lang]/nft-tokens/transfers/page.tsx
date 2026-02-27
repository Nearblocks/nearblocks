import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenTransfers } from '@/components/nft-tokens/transfers';
import { fetchNFTTxnCount, fetchNFTTxns } from '@/data/nft-tokens';

type Props = PageProps<'/[lang]/nft-tokens/transfers'>;

const NftTransfersPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const txnsPromise = fetchNFTTxns(filters);
  const txnCountPromise = fetchNFTTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">NFT Token Transfers (NEP-171)</h1>
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
