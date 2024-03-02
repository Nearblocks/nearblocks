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
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>{' '}
        </div>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
            <div className="w-full">
              <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
                <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                  Overview
                </h2>

                <div className="px-3 divide-y text-sm text-nearblue-600">
                  <div className="flex divide-x my-2">
                    <div className="flex-col flex-1 flex-wrap py-1">
                      <div className="w-full text-gray-400 text-xs uppercase mb-1  text-[80%]">
                        Price
                      </div>

                      <div className="w-20">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                    <div className="flex-col flex-1 flex-wrap py-1 px-3">
                      <div className="w-full text-gray-400 text-xs uppercase mb-1 flex  text-[80%]">
                        FULLY DILUTED MARKET CAP
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width={16}
                            height={16}
                            className="w-4 h-4 fill-current ml-1"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.501 3.501 0 1113 13.355z" />
                          </svg>
                        </span>
                      </div>

                      <div className="w-20">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Max Total Supply:
                    </div>

                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Transfers:
                    </div>

                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Holders:
                    </div>

                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
                <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                  Profile Summary
                </h2>
                <div className="px-3 divide-y text-sm text-nearblue-600">
                  <div className="flex flex-wrap items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Contract:
                    </div>

                    <div className="w-full md:w-3/4 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Decimals:
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Official Site:
                    </div>
                    <div className="w-full md:w-3/4 text-green-500 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Social Profiles:
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="py-6"></div>
          <div className="block lg:flex lg:space-x-2 mb-4">
            <div className="w-full">
              <div className="flex">
                <div
                  className={`rounded-lg bg-green-600 text-white text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none `}
                >
                  Transfers
                </div>{' '}
                <div
                  className={`text-nearblue-600 hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none  `}
                >
                  Holders
                </div>{' '}
                <div
                  className={`text-nearblue-600 hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none `}
                >
                  Info
                </div>{' '}
                <div
                  className={`text-nearblue-600 hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none `}
                >
                  FAQ
                </div>{' '}
                <div
                  className={`text-nearblue-600 hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none `}
                >
                  Comments
                </div>
              </div>

              <div className="relative">
                <div
                  ref={ref}
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
