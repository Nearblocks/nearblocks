import { FTsChart } from '@/components/address/analytics/fts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchFTStats } from '@/data/address/analytics';

type Props = PageProps<'/[lang]/address/[address]/analytics/tokens'>;

const FTsPage = async ({ params }: Props) => {
  const { address } = await params;
  const ftsPromise = fetchFTStats(address);

  return (
    <ErrorSuspense fallback={<FTsChart loading={true} />}>
      <FTsChart ftsPromise={ftsPromise} />
    </ErrorSuspense>
  );
};

export default FTsPage;
