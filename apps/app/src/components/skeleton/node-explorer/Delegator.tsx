import React, { forwardRef, Ref } from 'react';

import Skeleton from '../common/Skeleton';
interface Props {
  className?: string;
}
const Delegator = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  return (
    <div className={`w-full pr-6 z-10 ${props.className}`} ref={ref}>
      <div className="flex flex-col md:flex-row gap-4 ">
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <div>
              <div>
                <h2 className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
                  <span>Main Information</span>
                </h2>
              </div>
            </div>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Status</div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-7 w-16 break-words" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">Fee</div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-12 break-words" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">Contact</div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 sm:w-44 px-5 break-words" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
              Uptime information
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center py-4">
                <div className="w-60 md:w-1/4 mb-2 md:mb-0">Blocks</div>
                <div className="w-full text-green-500 md:w-3/4 break-words">
                  <Skeleton className="h-7 sm:w-65 w-full break-words" />
                </div>
              </div>
              <div className="flex items-center py-4">
                <div className="w-64 md:w-1/4 mb-2 md:mb-0">Chunks</div>
                <div className="w-full md:w-3/4 text-green-500 break-words">
                  <Skeleton className="h-7 sm:w-65 w-full break-words" />
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
            <div className="max-w-lg pl-0.5 w-80 py-5 ">
              <Skeleton className="sm:w-72 h-4" />
            </div>
          </div>
          <div className="overflow-x-auto ">
            <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
              <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
                <tr>
                  <th
                    className="pl-7 py-2 w-[37.2rem] whitespace-nowrap align-middle text-left text-xs font-semibold text-nearblue-600  uppercase tracking-wider"
                    scope="col"
                  >
                    Account
                  </th>
                  <th
                    className="pl-9 py-2 text-left text-xs font-semibold text-nearblue-600 align-middle uppercase tracking-wider whitespace-nowrap w-40"
                    scope="col"
                  >
                    Staked Balance
                  </th>
                  <th
                    className="px-6 py-2 text-left text-xs align-middle font-semibold text-nearblue-600  uppercase tracking-wider whitespace-nowrap w-40"
                    scope="col"
                  >
                    Unstaked Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                {[...Array(25)].map((_, i) => (
                  <tr className="hover:bg-blue-900/5 h-[53px]" key={i}>
                    <td className="pl-7 py-5 w-[37.2rem] text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="h-4 w-full" />
                    </td>
                    <td className="pl-9 py-6 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40">
                      <Skeleton className="h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white dark:bg-black-600 px-2 py-6 flex items-center justify-between dark:border-black-200 border-t md:px-4">
            <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div></div>
              <Skeleton className="w-72 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Delegator.displayName = 'Delegator';
export default Delegator;
