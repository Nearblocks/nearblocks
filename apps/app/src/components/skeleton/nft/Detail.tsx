import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';

const Detail = forwardRef((_props: any, ref: Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className="absolute w-full z-10">
      <div className="grid md:grid-cols-12 pt-4 mb-2">
        <div className="md:col-span-5 lg:col-span-4 pt-4">
          <div className="bg-white border rounded-lg soft-shadow p-3 aspect-square"></div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 md:px-4 lg:pl-8 pt-4">
          <h1 className="break-all space-x-2 text-xl text-gray-700 leading-8 font-semibold">
            <div className="w-80 max-w-xs">
              <Skeleton className="h-6" />
            </div>
          </h1>

          <div className="break-all text-green leading-6 text-sm hover:no-underline">
            <div className="w-60 max-w-xs py-2">
              <Skeleton className="h-4" />
            </div>
          </div>

          <div className="bg-white border rounded-xl soft-shadow mt-4">
            <div className="w-full py-4 flex justify-between items-center text-sm font-semibold text-gray-600 border-b focus:outline-none p-3">
              <h2>Details</h2>
            </div>
            <div className="text-sm text-nearblue-600">
              <div className="divide-solid divide-gray-200 divide-y">
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
            </div>
          </div>
        </div>
      </div>
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className=" pb-1">
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
  );
});
Detail.displayName = 'Detail';
export default Detail;
