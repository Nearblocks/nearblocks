import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';
interface Props {
  className?: string;
}
const Overview = forwardRef(
  ({ className }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} className={`w-full z-50 ${className}`}>
        <div className="flex items-center justify-between flex-wrap pt-4">
          <div className="w-80 max-w-xs px-3 py-5 bg-neargray-25 dark:bg-black-300">
            <Skeleton className="h-6" />
          </div>{' '}
        </div>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 -mb-0.5">
            <div className="w-full">
              <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <div className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600">
                  <div className="py-.5 text-sm font-semibold">
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600">
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-5 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-4 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-3.5 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <div className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600">
                  <div className="py-.5 text-sm font-semibold">
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>

                <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600">
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-5 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-4 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-3.5 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="py-6"></div>
          <div className="block lg:flex lg:space-x-2 mb-4 sm:mt-0 -mt-0.5">
            <div className="w-full">
              <div className=" flex">
                <div
                  className={`text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 rounded-lg hover:text-nearblue-600 text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none`}
                >
                  Transfers
                </div>{' '}
                <div
                  className={`text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 rounded-lg hover:text-nearblue-600 text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none`}
                >
                  Holders
                </div>{' '}
                <div
                  className={`text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700  dark:bg-black-200 rounded-lg hover:text-nearblue-600 text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none`}
                >
                  Inventory
                </div>{' '}
                <div
                  className={`text-nearblue-600 dark:text-neargray-10 hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 rounded-lg hover:text-nearblue-600 text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none`}
                >
                  Comments
                </div>
              </div>
              <div className="relative">
                <div
                  className={`bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden`}
                >
                  <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 px-3 py-2">
                    <div className="max-w-lg pl-3 w-full py-3.5 ">
                      <Skeleton className=" h-4" />
                    </div>
                  </div>
                  <div className="overflow-x-auto ">
                    <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200  border-t">
                      <thead className="bg-gray-100 dark:bg-black-200 h-[51px]">
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
                      <tbody className="bg-white dark:bg-black-600 dark:divide-black-200  divide-y divide-gray-200">
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
                  <div className="bg-white dark:bg-black-600 dark:border-black-200 px-2 py-3 flex items-center justify-between border-t md:px-4">
                    <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div></div>
                      <Skeleton className="w-64 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </div>
    );
  },
);
Overview.displayName = 'Overview';
export default Overview;
