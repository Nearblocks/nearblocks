import { ChainSignaturesTxnsChart } from '@/components/chain-signatures/charts/txns';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchSignerStats } from '@/data/chain-signatures';
import { holdNav } from '@/lib/hold-nav';

const ChainSignaturesAnalyticsPage = async () => {
  const statsPromise = fetchSignerStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<ChainSignaturesTxnsChart loading />}>
      <ChainSignaturesTxnsChart statsPromise={statsPromise} />
    </ErrorSuspense>
  );
};

export default ChainSignaturesAnalyticsPage;
