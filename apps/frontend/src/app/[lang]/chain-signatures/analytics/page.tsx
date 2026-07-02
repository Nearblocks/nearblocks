import { ChainSignaturesTxnsChart } from '@/components/chain-signatures/charts/txns';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchSignerStats } from '@/data/chain-signatures';

const ChainSignaturesAnalyticsPage = async () => {
  const statsPromise = fetchSignerStats();

  return (
    <ErrorSuspense fallback={<ChainSignaturesTxnsChart loading />}>
      <ChainSignaturesTxnsChart statsPromise={statsPromise} />
    </ErrorSuspense>
  );
};

export default ChainSignaturesAnalyticsPage;
