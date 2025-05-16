import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
interface Props {
  className?: string;
  error?: boolean;
}
const Latest = ({ className, error }: Props) => {
  return (
    <>
      <div
        className={`bg-white dark:bg-black-600 rounded-b-xl overflow-hidden w-full z-10 ${className}`}
      >
        <div className="relative">
          <div className="px-3 dark:divide-black-200 divide-y h-80 overflow-x-auto overflow-hidden">
            {!error ? (
              [...Array(5)].map((_, i) => (
                <div
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3"
                  key={i}
                >
                  <div className="flex items-center ">
                    <div className="flex-shrink-0 rounded-full h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm">
                      <Skeleton className="h-4" />
                    </div>
                    <div className="px-2">
                      <div className="text-green-500 text-sm">
                        <div className="h-5 w-14">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                      <div className="text-nearblue-600-400 text-xs">
                        <div className="h-3 w-24">
                          <Skeleton className="h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                    <div className="h-5 w-36">
                      <Skeleton className="h-4" />
                    </div>
                    <div className="text-nearblue-600-400 text-sm">
                      <div className="h-5 w-14">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="items-end order-1 md:order-2">
                    <div className="ml-auto w-20">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <ErrorMessage
                icons={<FaInbox />}
                message={''}
                mutedText="Please try again later"
                reset
              />
            )}
          </div>
        </div>
        {!error && (
          <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
            <Skeleton className="h-10" />
          </div>
        )}
      </div>
    </>
  );
};
Latest.displayName = 'Latest';
export default Latest;
