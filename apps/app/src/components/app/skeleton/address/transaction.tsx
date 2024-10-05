import Skeleton from '../common/Skeleton';
import TableSkeleton from '../common/table';

export default function TransactionSkeleton() {
  return (
    <>
      <div className="pl-6 max-w-lg w-full py-5 ">
        <Skeleton className="h-4" />
      </div>
      <TableSkeleton />
    </>
  );
}
