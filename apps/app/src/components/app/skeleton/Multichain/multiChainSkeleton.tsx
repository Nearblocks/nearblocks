import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import Skeleton from '@/components/app/skeleton/common/Skeleton';

const MultiChainSkeleton = ({ error }: { error?: boolean }) => {
  return (
    <div className=" w-full">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="w-full lg:col-span-2">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden p-5">
              <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase pb-3">
                {'TOTAL TRANSACTIONS'}
              </h2>
              {!error ? <Skeleton className="h-4 w-14" /> : ''}
              <div className="font-semibold text-xl text-gray-700 dark:text-neargray-10 flex flex-wrap items-center pt-3">
                <div className="w-full break-words"></div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden p-5">
              <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase pb-3">
                {'VOLUME(24H)'}
              </h2>
              {!error ? <Skeleton className="h-4 w-14" /> : ''}

              <div className="font-semibold text-xl text-gray-700 dark:text-neargray-10 flex flex-wrap items-center pt-3">
                <div className="w-full break-words"></div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl p-5">
              <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase pb-3">
                {'NETWORKS'}
              </h2>
              {!error ? <Skeleton className="h-4 w-14" /> : ''}

              <div className="font-semibold text-xl text-gray-700 dark:text-neargray-10 flex flex-wrap items-center pt-3">
                <div className="w-full break-words"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-6"></div>
      <div>
        <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
          <div className="overflow-x-auto scroll-smooth -mt-1">
            <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200  border-t">
              <thead className="bg-gray-100 dark:bg-black-200 h-[55px]">
                {!error && (
                  <tr>
                    <th
                      className="w-[3%] pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    ></th>
                    <th
                      className="w-[4%] pr-6 pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    >
                      <Skeleton className="h-4 w-44" />
                    </th>
                    <th
                      className="w-[10%] pr-12 pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    >
                      <Skeleton className="h-4 w-44" />
                    </th>
                    <th
                      className="w-[10%] pr-6 pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    >
                      <Skeleton className="h-4 w-44" />
                    </th>
                    <th
                      className="pr-1 pl-9 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    >
                      <Skeleton className="h-4 w-40" />
                    </th>
                    <th
                      className="pr-6 pl-2 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    >
                      <Skeleton className="h-4 w-40" />
                    </th>
                    <th
                      className="pl-4 pr-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                      scope="col"
                    >
                      <Skeleton className="h-4 w-32" />
                    </th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white dark:bg-black-600 dark:divide-black-200  divide-y divide-gray-200">
                {!error ? (
                  [...Array(18)].map((_, i) => (
                    <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
                      <td className="pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600">
                        <Skeleton className="h-4 w-6" />
                      </td>
                      <td className="pr-6 pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600">
                        <Skeleton className="h-4 w-44" />
                      </td>
                      <td className="pr-12 pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600">
                        <Skeleton className="h-4 w-44" />
                      </td>
                      <td className="pr-6 pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600">
                        <Skeleton className="h-4 w-44" />
                      </td>
                      <td className="pr-1 pl-9 py-4 whitespace-nowrap text-sm text-nearblue-600">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="pr-6 pl-2 py-4 whitespace-nowrap text-sm text-nearblue-600">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="pl-4 pr-6 py-4 whitespace-nowrap text-tiny ">
                        <Skeleton className="h-4 w-32" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <ErrorMessage
                    icons={<FaInbox />}
                    message={''}
                    mutedText="Please try again later"
                    reset
                  />
                )}
              </tbody>
            </table>
          </div>
          {!error && (
            <div className="bg-white dark:bg-black-600 dark:border-black-200 px-2 py-5 flex items-center justify-between border-t md:px-4">
              <div className="flex items-center justify-between w-full">
                <div></div>
                <Skeleton className="w-44 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiChainSkeleton;
