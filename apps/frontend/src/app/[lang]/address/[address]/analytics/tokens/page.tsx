import { FTsChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchFTStats } from '@/data/address/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/analytics/tokens'>;

const FTsPage = async ({ params }: Props) => {
  const { address } = await params;
  const ftsPromise = fetchFTStats(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<FTsChart loading={true} />}>
      <FTsChart ftsPromise={ftsPromise} />
    </ErrorSuspense>
  );
};

export default FTsPage;
