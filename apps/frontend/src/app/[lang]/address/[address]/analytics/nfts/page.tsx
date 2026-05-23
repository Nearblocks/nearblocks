import { NFTsChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchNFTStats } from '@/data/address/analytics';

type Props = PageProps<'/[lang]/address/[address]/analytics/nfts'>;

const NFTsPage = async ({ params }: Props) => {
  const { address } = await params;
  const nftsPromise = fetchNFTStats(address);

  return (
    <ErrorSuspense fallback={<NFTsChart loading={true} />}>
      <NFTsChart nftsPromise={nftsPromise} />
    </ErrorSuspense>
  );
};

export default NFTsPage;
