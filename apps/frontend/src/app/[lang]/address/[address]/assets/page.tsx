import { NFTAssets } from '@/components/address/assets/nfts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchNFTAssetCount, fetchNFTAssets } from '@/data/address/assets';
import { Card, CardContent } from '@/ui/card';

type Props = PageProps<'/[lang]/address/[address]/assets'>;

const AssetsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const nftsPromise = fetchNFTAssets(address, { ...filters, limit: '24' });
  const countPromise = fetchNFTAssetCount(address);

  return (
    <Card>
      <CardContent className="text-body-sm px-0 py-3">
        <ErrorSuspense fallback={<NFTAssets loading />}>
          <NFTAssets countPromise={countPromise} nftsPromise={nftsPromise} />
        </ErrorSuspense>
      </CardContent>
    </Card>
  );
};

export default AssetsPage;
