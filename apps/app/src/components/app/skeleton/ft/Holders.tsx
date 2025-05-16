import Skeleton from '@/components/app/skeleton/common/Skeleton';
import React from 'react';

const Holders = ({ nft }: { nft?: boolean }) => {
  return (
    <>
      <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 dark:text-neargray-10 px-3 py-2">
        <div className="max-w- pl-3 w-72 py-3.5 ">
          <Skeleton className=" h-4" />
        </div>
      </div>
      <div className="overflow-x-auto ">
        <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
          <thead className="bg-gray-100 dark:bg-black-200 h-[48px]">
            <tr>
              <th
                className="px-3 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top w-[5%]"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              {!nft && (
                <th
                  className="px-3 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top w-[29%]"
                  scope="col"
                >
                  <Skeleton className="h-4" />
                </th>
              )}
              <th
                className={`px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top ${
                  nft ? 'w-[57%]' : 'w-[24%]'
                }`}
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top w-[10%]"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
            {[...Array(25)].map((_, i) => (
              <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-center">
                  <Skeleton className="h-4" />
                </td>
                {!nft && (
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-center">
                    <Skeleton className="h-4" />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-center">
                  <Skeleton className="h-4" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-center">
                  <Skeleton className="h-4" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-center">
                  <Skeleton className="h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-black-600 px-2 py-6 flex items-center justify-between border-t dark:border-black-200 md:px-4">
        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div></div>
          <Skeleton className="w-64 h-4" />
        </div>
      </div>
    </>
  );
};

export default Holders;
