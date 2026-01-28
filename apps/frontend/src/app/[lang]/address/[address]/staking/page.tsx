import { StakingTxns } from '@/components/address/staking';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchStaking, fetchStakingCount } from '@/data/address/staking';

type Props = PageProps<'/[lang]/address/[address]/staking'>;

const StakingTxnsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const stakingPromise = fetchStaking(address, filters);
  const stakingCountPromise = fetchStakingCount(address, filters);

  return (
    <ErrorSuspense fallback={<StakingTxns loading />}>
      <StakingTxns
        stakingCountPromise={stakingCountPromise}
        stakingPromise={stakingPromise}
      />
    </ErrorSuspense>
  );
};

export default StakingTxnsPage;
