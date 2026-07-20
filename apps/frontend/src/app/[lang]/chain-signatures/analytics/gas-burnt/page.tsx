import { ChainSignaturesGasChart } from '@/components/chain-signatures/charts/gas';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchSignerStats } from '@/data/chain-signatures';
import { holdNav } from '@/lib/hold-nav';

const ChainSignaturesGasBurntPage = async () => {
  const statsPromise = fetchSignerStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<ChainSignaturesGasChart loading />}>
      <ChainSignaturesGasChart statsPromise={statsPromise} />
    </ErrorSuspense>
  );
};

export default ChainSignaturesGasBurntPage;
