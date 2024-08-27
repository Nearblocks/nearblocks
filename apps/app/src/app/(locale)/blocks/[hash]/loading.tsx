import Skeleton from '@/app/_components/skeleton/common/Skeleton';

export default function Loading() {
  return (
    <>
      <div className="relative container mx-auto px-3">
        <div className="md:flex items-center justify-between">
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        </div>
        <div className="bg-white text-sm text-nearblue-600 dark:text-neargray-10 dark:bg-black-600 dark:divide-black-200 divide-solid divide-gray-200 divide-y soft-shadow rounded-xl">
          <div className="flex flex-wrap p-4 text-red-500">
            <Skeleton className="w-full h-6" />
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-sm" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-xs" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <Skeleton className="h-5" />
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}