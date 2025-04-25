import React, { forwardRef, Ref } from 'react';

import ErrorMessage from '../../common/ErrorMessage';
import FaInbox from '../../Icons/FaInbox';
import Skeleton from '../common/Skeleton';

interface Props {
  className?: string;
  error?: boolean;
  reset?: any;
}

const ExplorerIndex = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  return (
    <div className={`w-full z-10 ${props.className}`} ref={ref}>
      <div className="flex flex-col md:flex-row gap-4 ">
        <div className="w-full md:w-1/2">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <div>
              <h2 className=" flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                <span>Staking Overview</span>
              </h2>
            </div>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Current Validators</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? (
                    ''
                  ) : (
                    <Skeleton className="h-4 w-16 break-words" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Total Staked</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? (
                    ''
                  ) : (
                    <Skeleton className="h-4 w-16 break-words" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Total Supply</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? (
                    ''
                  ) : (
                    <Skeleton className="h-4 w-16 break-words" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="h-full bg-white  dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
              Validator Information
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-1/4">Protocol Version</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? (
                    ''
                  ) : (
                    <Skeleton className="h-4 w-16 break-words" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-1/4">Next Seat Price</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? (
                    ''
                  ) : (
                    <Skeleton className="h-4 w-16 break-words" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-1/4">Current Seat Price</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? (
                    ''
                  ) : (
                    <Skeleton className="h-4 w-16 break-words" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
              Epoch Information
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Epoch Elapsed Time</div>
                <div className="w-full text-green-500 lg:w-3/4 break-words">
                  {props?.error ? '' : <Skeleton className="h-4 w-32" />}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Next Epoch ETA</div>
                <div className="w-full lg:w-3/4 text-green-500 break-words">
                  {props?.error ? '' : <Skeleton className="h-4 w-32" />}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Last Epoch APY</div>
                <div className="w-full lg:w-3/4 text-green-500 break-words">
                  {props?.error ? '' : <Skeleton className="h-4 w-16" />}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full lg:w-3/4">Progress</div>
                <div className="w-full lg:w-3/4 break-words">
                  {props?.error ? '' : <Skeleton className="h-3 w-full" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-5"></div>

      <div className="relative w-full mb-10">
        <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
          <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 px-3 py-2">
            <div className="max-w-lg  w-48 py-3.5">
              {props?.error ? '' : <Skeleton className="h-4" />}
            </div>
          </div>

          {!props?.error ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
                <thead className="bg-gray-100 dark:bg-black-300 h-[52px]">
                  <tr>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top w-[12%]"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top w-[6%]"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top w-[14%]"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top w-[7%]"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top w-[11%]"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top"
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                    <th
                      className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top "
                      scope="col"
                    >
                      {props?.error ? '' : <Skeleton className="h-4" />}
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                  {[...Array(28)].map((_, i) => (
                    <tr className="hover:bg-blue-900/5 h-[53px]" key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                        <Skeleton className="h-4" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                        <Skeleton className="h-4" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top">
                        <Skeleton className="h-4" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-tiny align-top">
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
          ) : (
            <div className="flex items-center justify-center min-h-[300px] w-full">
              <ErrorMessage
                icons={<FaInbox />}
                message={''}
                mutedText="Please try again later"
                reset={props?.reset}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ExplorerIndex.displayName = 'ExplorerIndex';
export default ExplorerIndex;
