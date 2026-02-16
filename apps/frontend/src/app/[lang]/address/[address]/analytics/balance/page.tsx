import { BalanceChart } from '@/components/address/analytics/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchBalanceStats } from '@/data/address/analytics';

type Props = PageProps<'/[lang]/address/[address]/analytics/balance'>;

const BalancePage = async ({ params }: Props) => {
  const { address } = await params;
  const balancePromise = fetchBalanceStats(address);

  return (
    <ErrorSuspense fallback={<BalanceChart loading={true} />}>
      <BalanceChart balancePromise={balancePromise} />
    </ErrorSuspense>
  );
};

export default BalancePage;
