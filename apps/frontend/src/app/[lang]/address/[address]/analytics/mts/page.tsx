import { MTsChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchMTStats } from '@/data/address/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/analytics/mts'>;

const MTsPage = async ({ params }: Props) => {
  const { address } = await params;
  const mtsPromise = fetchMTStats(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<MTsChart loading={true} />}>
      <MTsChart mtsPromise={mtsPromise} />
    </ErrorSuspense>
  );
};

export default MTsPage;
