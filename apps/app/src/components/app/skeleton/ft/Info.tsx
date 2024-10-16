import Skeleton from '../common/Skeleton';

const Info = () => {
  return (
    <>
      <div className="w-full mx-auto">
        <div className="px-3 pt-2 pb-5 text-sm text-gray">
          <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
            Overview
          </h3>
          <div className="text-sm py-2 text-nearblue-600 dark:text-neargray-10">
            <Skeleton className="w-1/3 h-4" />
          </div>

          <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
            Market
          </h3>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">Volume (24H):</div>
            <div className="w-full md:w-3/4 break-words">
              <Skeleton className="w-full h-4" />
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">Circulating MC:</div>
            <div className="w-full md:w-3/4 break-words">
              <Skeleton className="w-full h-4" />
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">On-chain MC:</div>
            <div className="w-full md:w-3/4 break-words">
              <Skeleton className="w-full h-4" />
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              Circulating Supply:
            </div>
            <div className="w-full md:w-3/4 break-words">
              <Skeleton className="w-full h-4" />
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 pt-6 text-gray-400 dark:text-neargray-10 text-xs">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              Market Data Source:
            </div>
            <div className="w-full md:w-3/4 break-words flex">
              <Skeleton className="w-full h-4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Info;
