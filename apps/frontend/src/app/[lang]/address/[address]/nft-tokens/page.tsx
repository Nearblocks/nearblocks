import { NFTTxns } from '@/components/address/nfts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchNFTTxnCount, fetchNFTTxns } from '@/data/address/nfts';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/nft-tokens'>;

const NFTTxnsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const nftsPromise = fetchNFTTxns(address, filters);
  const nftCountPromise = fetchNFTTxnCount(address, filters);
  await holdNav();

  return (
    <ErrorSuspense fallback={<NFTTxns loading />}>
      <NFTTxns nftCountPromise={nftCountPromise} nftsPromise={nftsPromise} />
    </ErrorSuspense>
  );
};

export default NFTTxnsPage;
