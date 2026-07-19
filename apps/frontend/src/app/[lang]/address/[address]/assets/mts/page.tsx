import { MTAssets } from '@/components/address/assets/mts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchMTFTAssetCount, fetchMTFTAssets } from '@/data/address/assets';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/assets/mts'>;

const MTTokenAssetsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const mtsPromise = fetchMTFTAssets(address, { ...filters, limit: '25' });
  const countPromise = fetchMTFTAssetCount(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<MTAssets account={address} loading />}>
      <MTAssets
        account={address}
        countPromise={countPromise}
        mtsPromise={mtsPromise}
      />
    </ErrorSuspense>
  );
};

export default MTTokenAssetsPage;
