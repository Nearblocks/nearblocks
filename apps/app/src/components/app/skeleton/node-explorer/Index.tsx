import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';
interface Props {
  className?: string;
}
const ExplorerIndex = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={`w-full z-10 ${props.className}`}>
      <div className="flex flex-col md:flex-row gap-4 ">
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <div>
              <h2 className=" flex justify-between border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
                <span>Staking Overview</span>
              </h2>
            </div>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  Current Validators
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Total Staked
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Current Seat Price
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Total Supply
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b dark:border-black-200 dark:text-neargray-10 p-3 text-gray-600 text-sm font-semibold">
              Epoch Information
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Epoch Elapsed Time
                </div>
                <div className="w-full text-green-500 md:w-3/4 break-words">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Next Epoch ETA
                </div>
                <div className="w-full md:w-3/4 text-green-500 break-words">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Last Epoch APY
                </div>
                <div className="w-full md:w-3/4 text-green-500 break-words">
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Progress</div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-5"></div>
      <div className="relative w-full mb-10">
        <div
          className={`bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden`}
        >
          <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 px-3 py-2">
            <div className="max-w-lg pl-3 w-full py-3.5 ">
              <Skeleton className=" h-4" />
            </div>
          </div>
          <div className="overflow-x-auto ">
            <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
              <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                {[...Array(25)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-900/5 h-[53px]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600  align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-tiny align-top ">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                      <Skeleton className="h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between dark:border-black-200 border-t md:px-4">
            <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div></div>
              <Skeleton className="w-64 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ExplorerIndex.displayName = 'ExplorerIndex';
export default ExplorerIndex;
