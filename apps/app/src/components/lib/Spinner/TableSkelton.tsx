import React from 'react';
import Loader from './Loader';

const TableSkelton = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-between text-left text-sm  text-gray-500 px-3 py-2">
        <div className="max-w-lg pl-3 w-full h-10 ">
          <Loader className="mt-2" />
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
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
              <th
                scope="col"
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top"
              >
                <Loader />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(25)].map((_, i) => (
              <tr key={i} className="hover:bg-blue-900/5 h-[53px]">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500  align-top">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-tiny align-top ">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  <Loader />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  <Loader />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-2 py-3 flex items-center justify-between border-t md:px-4">
        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div></div>
          <Loader className="w-64" />
        </div>
      </div>
    </>
  );
};

export default TableSkelton;
