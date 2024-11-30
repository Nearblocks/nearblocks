import Skeleton from '../common/Skeleton';
import TableSkeleton from '../common/table';

export default function TokenTxnsSkeleton() {
  return (
    <>
      <div className="pl-6 max-w-lg w-full py-6">
        <Skeleton className="h-5 w-1/2" />
      </div>
      <TableSkeleton />
    </>
  );
}
