import { MTNFTAssets } from '@/components/address/assets/mt-nfts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchMTNFTAssetCount, fetchMTNFTAssets } from '@/data/address/assets';

type Props = PageProps<'/[lang]/address/[address]/assets/mts/nfts'>;

const MTNFTAssetsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const nftsPromise = fetchMTNFTAssets(address, { ...filters, limit: '24' });
  const countPromise = fetchMTNFTAssetCount(address);

  return (
    <ErrorSuspense fallback={<MTNFTAssets account={address} loading />}>
      <MTNFTAssets
        account={address}
        countPromise={countPromise}
        nftsPromise={nftsPromise}
      />
    </ErrorSuspense>
  );
};

export default MTNFTAssetsPage;
