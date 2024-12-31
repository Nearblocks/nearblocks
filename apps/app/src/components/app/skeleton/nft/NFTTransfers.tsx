import React from 'react';

import ErrorMessage from '../../common/ErrorMessage';
import FaInbox from '../../Icons/FaInbox';
import Skeleton from '../common/Skeleton';

export default function TransferSkeleton({ error }: { error?: boolean }) {
  return (
    <>
      <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 px-3 py-2">
        <div className="max-w-lg pl-3 w-full py-3.5 ">
          {!error ? <Skeleton className=" h-4" /> : ''}
        </div>
      </div>
      <div className="overflow-x-auto ">
        <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200  border-t">
          {!error && (
            <thead className="bg-gray-100 dark:bg-black-200 h-[51px]">
              <tr>
                <th
                  className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
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
                <th
                  className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
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
                <th
                  className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
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
                <th
                  className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
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
          )}
          <tbody className="bg-white dark:bg-black-600 dark:divide-black-200  divide-y divide-gray-200">
            {!error ? (
              [...Array(25)].map((_, i) => (
                <tr className="hover:bg-blue-900/5 h-[53px]" key={i}>
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
              ))
            ) : (
              <div className="w-full">
                <ErrorMessage
                  icons={<FaInbox />}
                  message={''}
                  mutedText="Please try again later"
                  reset
                />
              </div>
            )}
          </tbody>
        </table>
      </div>
      {!error ? (
        <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4">
          <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div></div>
            <Skeleton className="w-64 h-4" />
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  );
}
