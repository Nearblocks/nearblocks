import React, { Ref, forwardRef } from 'react';
import Skeleton from './Skeleton';
interface Props {
  showRounded?: boolean;
  className?: string;
}
const List = forwardRef(
  ({ showRounded, className }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div className={`w-full z-10 ${className}`}>
        <div
          ref={ref}
          className={`bg-white  dark:bg-black-600 dark:border-black-200 border soft-shadow ${
            !showRounded ? 'rounded-xl' : ''
          } overflow-hidden`}
        >
          <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 px-3 py-2">
            <div className="max-w-lg pl-3 w-full py-3.5 ">
              <Skeleton className=" h-4" />
            </div>
          </div>
          <div className="overflow-x-auto ">
            <table className="min-w-full divide-y dark:border-black-200 dark:divide-black-200 border-t">
              <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
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
              <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                {[...Array(25)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
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
          <div className="bg-white dark:bg-black-600 dark:border-black-200 px-2 py-3 flex items-center justify-between border-t md:px-4">
            <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div></div>
              <Skeleton className="w-64 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
List.displayName = 'List';
export default List;
