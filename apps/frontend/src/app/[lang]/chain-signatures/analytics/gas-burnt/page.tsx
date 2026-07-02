import { ChainSignaturesGasChart } from '@/components/chain-signatures/charts/gas';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchSignerStats } from '@/data/chain-signatures';

const ChainSignaturesGasBurntPage = async () => {
  const statsPromise = fetchSignerStats();

  return (
    <ErrorSuspense fallback={<ChainSignaturesGasChart loading />}>
      <ChainSignaturesGasChart statsPromise={statsPromise} />
    </ErrorSuspense>
  );
};

export default ChainSignaturesGasBurntPage;
