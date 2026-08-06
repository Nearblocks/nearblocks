import { ErrorSuspense } from '@/components/error-suspense';
import { ProductionChart } from '@/components/validators/node/charts';
import {
  fetchValidatorBlockStats,
  fetchValidatorChunkStats,
} from '@/data/validators';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/validators/[node]/analytics'>;

const AnalyticsPage = async ({ params }: Props) => {
  const { node } = await params;
  const blocksPromise = fetchValidatorBlockStats(node);
  const chunksPromise = fetchValidatorChunkStats(node);
  await holdNav();

  return (
    <ErrorSuspense fallback={<ProductionChart loading />}>
      <ProductionChart
        blocksPromise={blocksPromise}
        chunksPromise={chunksPromise}
      />
    </ErrorSuspense>
  );
};

export default AnalyticsPage;
