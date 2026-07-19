import { NearChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchNearStats } from '@/data/address/analytics';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/analytics/near'>;

const NearPage = async ({ params }: Props) => {
  const { address } = await params;
  const nearPromise = fetchNearStats(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<NearChart loading={true} />}>
      <NearChart nearPromise={nearPromise} />
    </ErrorSuspense>
  );
};

export default NearPage;
