import { ErrorSuspense } from '@/components/error-suspense';
import { TransfersChart } from '@/components/mt-tokens/analytics/charts';
import {
  fetchMTTokenStatsAccountTransfers,
  fetchMTTokenStatsTransfers,
} from '@/data/mt-tokens/analytics';
import { holdNav } from '@/lib/hold-nav';
import { decodeToken } from '@/lib/utils';

type Props =
  PageProps<'/[lang]/mt-tokens/[cid]/tokens/[tid]/analytics/transfers'>;

const AnalyticsTransfersPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid: rawTid }, { account }] = await Promise.all([
    params,
    searchParams,
  ]);
  const tid = decodeToken(rawTid);

  if (account && typeof account === 'string') {
    const accountTransfersPromise = fetchMTTokenStatsAccountTransfers(
      cid,
      tid,
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

  const transfersPromise = fetchMTTokenStatsTransfers(cid, tid, {
    limit: '365',
  });
  await holdNav();

  return (
    <ErrorSuspense fallback={<TransfersChart loading />}>
      <TransfersChart transfersPromise={transfersPromise} />
    </ErrorSuspense>
  );
};

export default AnalyticsTransfersPage;
