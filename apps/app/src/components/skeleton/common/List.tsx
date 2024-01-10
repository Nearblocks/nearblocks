import React from 'react';
import Skeleton from './Skeleton';

const List = () => {
  return (
    <div className="absolute w-full h-full z-10">
      <div className=" bg-white border soft-shadow rounded-lg overflow-hidden">
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
  );
};

export default List;
