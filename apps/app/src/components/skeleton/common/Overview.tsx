import React, { Ref, forwardRef } from 'react';
import Skeleton from './Skeleton';
interface Props {
  className?: string;
}
const Overview = forwardRef(
  ({ className }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} className={`w-full z-50 ${className}`}>
        <div className="flex items-center justify-between flex-wrap pt-4">
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-6" />
          </div>{' '}
        </div>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full">
              <div className="h-full bg-white soft-shadow rounded-xl">
                <div className="flex justify-between border-b p-3 text-gray-600">
                  <div className="py-.5 text-sm font-semibold">
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <div className="px-3 divide-y text-sm text-gray-600">
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
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="h-full bg-white soft-shadow rounded-xl">
                <div className="flex justify-between border-b p-3 text-gray-600">
                  <div className="py-.5 text-sm font-semibold">
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>

                <div className="px-3 divide-y text-sm text-gray-600">
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
                </div>
              </div>
            </div>
          </div>
          <div className="py-6"></div>
          <div className="block lg:flex lg:space-x-2 mb-3">
            <div className="w-full">
              <div>
                <div
                  className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-1.5 mr-2 focus:outline-none hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600`}
                >
                  Transactions
                </div>
                <div
                  className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-1.5 mr-2 focus:outline-none hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600`}
                >
                  Token Txns
                </div>
                <div
                  className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-1.5 mr-2 focus:outline-none  hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600`}
                >
                  NFT Token Txns
                </div>
                <div
                  className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-1.5 mr-2 focus:outline-none hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600`}
                >
                  Access Keys
                </div>
                <div
                  className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-1.5 mr-2 focus:outline-none hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600`}
                >
                  Comments
                </div>
              </div>
              <div className="relative">
                <div
                  className={`bg-white border soft-shadow rounded-xl overflow-hidden`}
                >
                  <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 px-3 py-2">
                    <div className="max-w-lg pl-3 w-full py-3.5 ">
                      <Skeleton className=" h-4" />
                    </div>
                  </div>
                  <div className="overflow-x-auto ">
                    <table className="min-w-full divide-y border-t">
                      <thead className="bg-gray-100 h-[51px]">
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
                      <tbody className="bg-white divide-y divide-gray-200">
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
                  <div className="bg-white px-2 py-3 flex items-center justify-between border-t md:px-4">
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
