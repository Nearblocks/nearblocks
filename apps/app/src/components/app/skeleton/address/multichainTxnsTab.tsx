import Skeleton from '../common/Skeleton';
import TableSkeleton from '../common/table';

export default function MultichaintxnsSkeleton() {
  return (
    <>
      <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
        <TableSkeleton />
      </div>
    </>
  );
}
