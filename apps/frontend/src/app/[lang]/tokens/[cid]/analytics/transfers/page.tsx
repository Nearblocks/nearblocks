import { ErrorSuspense } from '@/components/error-suspense';
import { TransfersChart } from '@/components/tokens/analytics/charts';
import {
  fetchFTContractStatsAccountTransfers,
  fetchFTContractStatsTransfers,
} from '@/data/tokens/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/tokens/[cid]/analytics/transfers'>;

const AnalyticsTransfersPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, { account }] = await Promise.all([params, searchParams]);

  if (account && typeof account === 'string') {
    const accountTransfersPromise = fetchFTContractStatsAccountTransfers(
      cid,
      account,
      { limit: '365' },
    );
    await holdNav();

    return (
      <ErrorSuspense fallback={<TransfersChart loading />}>
        <TransfersChart accountTransfersPromise={accountTransfersPromise} />
      </ErrorSuspense>
    );
  }

  const transfersPromise = fetchFTContractStatsTransfers(cid, { limit: '365' });
  await holdNav();

  return (
    <ErrorSuspense fallback={<TransfersChart loading />}>
      <TransfersChart transfersPromise={transfersPromise} />
    </ErrorSuspense>
  );
};

export default AnalyticsTransfersPage;
