import { ErrorSuspense } from '@/components/error-suspense';
import { TransfersChart } from '@/components/mt-tokens/analytics/charts';
import { fetchMTTokenStatsTransfers } from '@/data/mt-tokens/analytics';

type Props =
  PageProps<'/[lang]/mt-tokens/[cid]/tokens/ft/[tid]/analytics/transfers'>;

const AnalyticsTransfersPage = async ({ params }: Props) => {
  const { cid, tid } = await params;

  const transfersPromise = fetchMTTokenStatsTransfers(cid, tid, {
    limit: '365',
  });

  return (
    <ErrorSuspense fallback={<TransfersChart loading />}>
      <TransfersChart transfersPromise={transfersPromise} />
    </ErrorSuspense>
  );
};

export default AnalyticsTransfersPage;
