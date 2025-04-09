import Skeleton from '../common/Skeleton';

const FAQ = () => {
  return (
    <div>
      <div className="px-3 pb-2 text-sm divide-y divide-gray-200 dark:divide-black-200 space-y-2">
        <div>
          <h3 className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-4">
            <Skeleton className="w-40 h-4" />
          </h3>
          <div>
            <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
              <Skeleton className="w-full h-8" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-5 pb-2">
            <Skeleton className="w-40 h-4" />
          </h3>
          <div>
            <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
              <Skeleton className="w-full h-8" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-3 pb-2">
            <Skeleton className="w-40 h-4" />
          </h3>
          <div>
            <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
              <Skeleton className="w-full h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FAQ;
