import { FTAssets } from '@/components/address/assets/fts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchFTAssetCount, fetchFTAssets } from '@/data/address/assets';

type Props = PageProps<'/[lang]/address/[address]/assets'>;

const TokenAssetsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const ftsPromise = fetchFTAssets(address, { ...filters, limit: '25' });
  const countPromise = fetchFTAssetCount(address);

  return (
    <ErrorSuspense fallback={<FTAssets account={address} loading />}>
      <FTAssets
        account={address}
        countPromise={countPromise}
        ftsPromise={ftsPromise}
      />
    </ErrorSuspense>
  );
};

export default TokenAssetsPage;
