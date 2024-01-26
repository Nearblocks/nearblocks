import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';

const Index = forwardRef((_props: any, ref: Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className="absolute w-full z-10">
      <div className="flex flex-col md:flex-row gap-4 ">
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <div>
              <h2 className=" flex justify-between border-b p-3 text-gray-600 text-sm font-semibold">
                <span>Staking Overview</span>
              </h2>
            </div>
            <div className="px-3 divide-y text-sm text-gray-600">
              <div className="flex  py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Current Validators
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex  py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Total Staked
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-16 break-words" />
                </div>
              </div>
              <div className="flex max-md:divide-y  flex-col md:flex-row ">
                <div className="flex w-full md:w-1/2 py-4">
                  <div className="w-full mb-2 md:mb-0">Current Seat Price</div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-16 break-words" />
                  </div>
                </div>
                <div className="flex w-full md:w-1/2 py-4">
                  <div className="w-full mb-2 md:mb-0">Total Supply</div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-16 break-words" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full md:w-1/2">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
              Epoch Information
            </h2>
            <div className="px-3 divide-y text-sm text-gray-600">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Epoch Elapsed Time:
                </div>
                <div className="w-full text-green-500 md:w-3/4 break-words">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">ETA:</div>
                <div className="w-full md:w-3/4 text-green-500 break-words">
                  <Skeleton className="h-3 w-32" />
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
          className={`bg-white border soft-shadow rounded-xl overflow-hidden`}
        >
          <div className=" flex flex-row items-center justify-between text-left text-sm  text-gray-500 px-3 py-2">
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
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
                  >
                    <Skeleton className="h-4" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(25)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-900/5 h-[53px]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500  align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-tiny align-top ">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      <Skeleton className="h-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
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
  );
});
Index.displayName = 'Index';
export default Index;
