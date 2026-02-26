import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokenTransfers } from '@/components/nft-tokens/transfers';
import { fetchNFTTxnCount, fetchNFTTxns } from '@/data/nft-tokens';

const NftTransfersPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const filters = await searchParams;
  const nftsPromise = fetchNFTTxns(filters);
  const nftCountPromise = fetchNFTTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">NFT Token Transfers (NEP-171)</h1>
      <ErrorSuspense fallback={<NftTokenTransfers loading />}>
        <NftTokenTransfers
          nftCountPromise={nftCountPromise}
          nftsPromise={nftsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NftTransfersPage;
