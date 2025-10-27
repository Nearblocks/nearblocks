import Skeleton from '@/components/app/skeleton/common/Skeleton';
import TableSkeleton from '../common/table';

export default function AccessKeyTabSkeleton() {
  return (
    <>
      <div className="pl-6 max-w-lg w-full py-5">
        <Skeleton className="h-5 w-1/2" />
      </div>
      <TableSkeleton />
    </>
  );
}
