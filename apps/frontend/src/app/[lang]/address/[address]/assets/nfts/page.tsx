import { NFTAssets } from '@/components/address/assets/nfts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchNFTAssetCount, fetchNFTAssets } from '@/data/address/assets';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/assets/nfts'>;

const NFTAssetsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const nftsPromise = fetchNFTAssets(address, { ...filters, limit: '24' });
  const countPromise = fetchNFTAssetCount(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<NFTAssets loading />}>
      <NFTAssets countPromise={countPromise} nftsPromise={nftsPromise} />
    </ErrorSuspense>
  );
};

export default NFTAssetsPage;
