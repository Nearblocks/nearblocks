import Skeleton from '@/components/app/skeleton/common/Skeleton';
const Execution = () => {
  return (
    <>
      <div className="flex flex-col w-full mx-auto divide-y dark:divide-black-200">
        <div className="flex justify-end w-full p-4 items-center">
          <div className="cursor-pointer mx-1 flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-1 border border-neargray-700 dark:border-black-200 px-1.5 rounded-md bg-whit select-none">
            <span>
              <span className="mr-1.5 text-[13px]">Expand All </span>+
            </span>
          </div>
        </div>
        <div className="p-4 md:px-8 overflow-auto">
          <div>
            <div className="flex flex-row mb-2.5">
              <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
              <div className="text-green-500 dark:text-green-250 text-sm">
                <Skeleton className="w-40 h-4" />
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div className="border-green-500 dark:border-green-250" key={i}>
                <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
                  <Skeleton className="w-25 h-8" />
                </div>
                <div className="relative flex flex-row my-2.5">
                  <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                  <div className="text-green-500 dark:text-green-250 text-sm ">
                    <Skeleton className="w-40 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default Execution;
