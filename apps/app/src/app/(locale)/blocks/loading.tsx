import ListSkeleton from '@/app/_components/skeleton/blocks/list';
import Skeleton from '@/app/_components/skeleton/common/Skeleton';

export default function Loading() {
  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            Latest Near Protocol Blocks
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1">
              <div className="pl-6 max-w-lg w-full py-5">
                <Skeleton className="pl-6 max-w-sm leading-7 h-4" />
              </div>
              <ListSkeleton />
            </div>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
