import { MTsChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchMTStats } from '@/data/address/analytics';

type Props = PageProps<'/[lang]/address/[address]/analytics/mts'>;

const MTsPage = async ({ params }: Props) => {
  const { address } = await params;
  const mtsPromise = fetchMTStats(address);

  return (
    <ErrorSuspense fallback={<MTsChart loading={true} />}>
      <MTsChart mtsPromise={mtsPromise} />
    </ErrorSuspense>
  );
};

export default MTsPage;
