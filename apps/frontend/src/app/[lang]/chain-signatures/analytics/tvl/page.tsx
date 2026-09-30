import { ChainSignaturesTvlChart } from '@/components/chain-signatures/charts/tvl';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchTvlStats } from '@/data/chain-signatures';
import { holdNav } from '@/lib/hold-nav';

const ChainSignaturesTvlPage = async () => {
  const statsPromise = fetchTvlStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<ChainSignaturesTvlChart loading />}>
      <ChainSignaturesTvlChart statsPromise={statsPromise} />
    </ErrorSuspense>
  );
};

export default ChainSignaturesTvlPage;
