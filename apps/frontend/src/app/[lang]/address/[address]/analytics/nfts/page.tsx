import { NFTsChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchNFTStats } from '@/data/address/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/analytics/nfts'>;

const NFTsPage = async ({ params }: Props) => {
  const { address } = await params;
  const nftsPromise = fetchNFTStats(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<NFTsChart loading={true} />}>
      <NFTsChart nftsPromise={nftsPromise} />
    </ErrorSuspense>
  );
};

export default NFTsPage;
