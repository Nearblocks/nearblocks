import React, { forwardRef, Ref } from 'react';

import Skeleton from '../common/Skeleton';
import ErrorMessage from '../../common/ErrorMessage';
import FaInbox from '../../Icons/FaInbox';
interface Props {
  className?: string;
  error?: boolean;
  reset?: any;
}
const NFTDetail = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const { error, reset } = props;
  return (
    <div className={`w-full z-10 ${props.className}`} ref={ref}>
      <div className="container-xxl mx-auto px-5">
        <div className="grid md:grid-cols-12 grid-cols-1 pt-4 mb-2">
          <div className="md:col-span-5 lg:col-span-4 pt-4">
            <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl soft-shadow p-3 aspect-square"></div>
          </div>
          <div
            className={`md:col-span-7 lg:col-span-8 md:px-4 lg:pl-8 ${
              !error ? 'pt-4' : ''
            }`}
          >
            {!error && (
              <h1 className="break-all space-x-2 text-xl text-gray-700 leading-8 font-semibold">
                <div className="w-80 max-w-xs">
                  <Skeleton className="h-6" />
                </div>
              </h1>
            )}

            {!error && (
              <div className="break-all text-green leading-6 text-sm hover:no-underline">
                <div className="w-60 max-w-xs py-2">
                  <Skeleton className="h-4" />
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl soft-shadow mt-4">
              <div className="w-full py-4 flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3">
                <h2>Details</h2>
              </div>
              <div className="text-sm text-nearblue-600">
                {!error ? (
                  <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        {' '}
                        <Skeleton className="h-4 max-w-xs" />
                      </div>
                    </div>

                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        {' '}
                        <Skeleton className="h-4 max-w-xs" />
                      </div>
                    </div>
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        {' '}
                        <Skeleton className="h-4 max-w-xs" />
                      </div>
                    </div>
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        {' '}
                        <Skeleton className="h-4 max-w-xs" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center overflow-hidden">
                    <div className="flex items-center">
                      <ErrorMessage
                        icons={<FaInbox />}
                        message={''}
                        mutedText="Please try again later"
                        reset={reset}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-10">
          <div className="w-full ">
            <div
              className={`bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden`}
            >
              <>
                {!error ? (
                  <>
                    <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 px-3 py-2">
                      <div className="max-w-lg pl-3 w-full py-3.5 ">
                        <Skeleton className=" h-4" />
                      </div>
                    </div>
                    <div className="overflow-x-auto ">
                      <table className="min-w-full divide-y border-t dark:divide-black-200 dark:border-black-200">
                        <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
                          <tr>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                            <th
                              className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                              scope="col"
                            >
                              <Skeleton className="h-4" />
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                          {[...Array(25)].map((_, i) => (
                            <tr
                              className="hover:bg-blue-900/5 h-[53px]"
                              key={i}
                            >
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
                    <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t md:px-4">
                      <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div></div>
                        <Skeleton className="w-64 h-4" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="pl-6 max-w-lg w-full py-5 ">
                      <div className="pl-6 max-w-sm leading-7 h-4" />
                    </div>
                    <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
                      <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
                        <tr className="h-[57px]">
                          <td
                            className="px-6 py-4 text-gray-400 text-xs rounded-b-xl"
                            colSpan={100}
                          >
                            <ErrorMessage
                              icons={<FaInbox />}
                              message={''}
                              mutedText="Please try again later"
                              reset
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
NFTDetail.displayName = 'Detail';
export default NFTDetail;
