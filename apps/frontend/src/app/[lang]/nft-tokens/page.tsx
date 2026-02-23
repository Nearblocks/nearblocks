import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokens } from '@/components/nft-tokens';
import { fetchNFTTokenCount, fetchNFTTokens } from '@/data/nft-tokens';

type Props = PageProps<'/[lang]/nft-tokens'>;

const NftTokensPage = async ({ searchParams }: Props) => {
  const filters = await searchParams;
  const nftTokensPromise = fetchNFTTokens(filters);
  const nftTokenCountPromise = fetchNFTTokenCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">
        Non-Fungible Token Tracker (NEP-171)
      </h1>
      <ErrorSuspense fallback={<NftTokens loading />}>
        <NftTokens
          nftTokenCountPromise={nftTokenCountPromise}
          nftTokensPromise={nftTokensPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NftTokensPage;
