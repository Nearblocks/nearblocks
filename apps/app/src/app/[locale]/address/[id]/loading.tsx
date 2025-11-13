import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabSkeletion from '@/components/app/skeleton/address/tab';

export default function Loading() {
  return (
    <div>
      <BalanceSkeleton />
      <div className="py-2"></div>
      <TabSkeletion />
    </div>
  );
}
