import Skeleton from '../common/Skeleton';
import TableSkeleton from '../common/table';

export default function TokensSkeleton() {
  return (
    <>
      <div className=" bg-white  dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1 ">
        <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 dark:text-neargray-10 px-3 py-2">
          <p className="pl-3">
            <Skeleton className="h-4" />
          </p>
          <div className="flex w-full h-10 sm:w-80 mr-2">
            <div className="flex-grow"></div>
          </div>
        </div>
        <TableSkeleton />
      </div>
    </>
  );
}
