import React from 'react';

import Skeleton from '../common/Skeleton';

function ListSkeletion() {
  return (
    <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
      <div className={`flex flex-col lg:flex-row pt-4`}>
        <div className="flex flex-col">
          <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10 h-8" />
        </div>
      </div>
      <div className="overflow-x-auto scroll-smooth -mt-1">
        <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200  border-t">
          <thead className="bg-gray-100 dark:bg-black-200 h-[55px]">
            <tr>
              <th
                className="w-[3%] pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              ></th>
              <th
                className=" w-[1%] pl-1 pr-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-32" />
              </th>
              <th
                className="w-[5%] px-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-20" />
              </th>
              <th
                className="w-[3%] pl-1 pr-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-20" />
              </th>
              <th
                className="w-[6%] pl-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-20" />
              </th>
              <th
                className="w-[8%] pl-1 pr-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-32" />
              </th>
              <th
                className="w-[4%] pr-6 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-32" />
              </th>
              <th
                className="w-[5%] py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-20" />
              </th>
              <th
                className="w-[10%] pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4 w-24" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black-600 dark:divide-black-200  divide-y divide-gray-200">
            {[...Array(25)].map((_, i) => (
              <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
                <td className="pl-3 py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-6" />
                </td>
                <td className="pl-1 pr-6 py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="items-center px-6 py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="pl-1 pr-6 py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="pl-6 py-3 whitespace-nowrap text-sm text-nearblue-600 ">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="pl-1 py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="pr-4 py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="py-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="py-3 pl-4 pr-3 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4 w-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-black-600 dark:border-black-200 px-2 py-5 flex items-center justify-between border-t md:px-4 rounded-b-lg">
        <div className="flex items-center justify-between w-full">
          <div></div>
          <Skeleton className="w-64 h-4" />
        </div>
      </div>
    </div>
  );
}

export default ListSkeletion;
