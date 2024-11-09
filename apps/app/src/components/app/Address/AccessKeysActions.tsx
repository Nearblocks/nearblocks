'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { useState } from 'react';

import { AccountContractInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Paginator from '../common/Paginator';
import FaInbox from '../Icons/FaInbox';
import SortIcon from '../Icons/SortIcon';
import AccessKeyRow from './AccessKeyRow';

interface Props {
  count: number;
  error: boolean;
  keys: AccountContractInfo[];
  tab?: string;
}

const AccessKeysActions = ({ count, error, keys }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [showWhen, setShowWhen] = useState(true);
  const toggleShowWhen = () => setShowWhen((s) => !s);

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
  };

  return (
    <>
      <div className="relative overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y rounded-xl dark:divide-black-200 dark:border-black-200">
          <thead className="bg-gray-100 dark:bg-black-300">
            <tr>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Txn Hash
              </th>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Public key
              </th>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Access
              </th>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Contract
              </th>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Method
              </th>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Allowance
              </th>
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                scope="col"
              >
                Action
              </th>
              <th className="text-left whitespace-nowrap" scope="col">
                <div className="w-full inline-flex px-4 py-4">
                  <button
                    className="text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-600 dark:text-neargray-10 focus:outline-none"
                    onClick={toggleShowWhen}
                    type="button"
                  >
                    {showWhen ? 'When' : 'Date Time (UTC)'}
                  </button>
                  <button className="px-2" onClick={onOrder} type="button">
                    <div className="text-nearblue-600  dark:text-neargray-10 font-semibold">
                      <SortIcon order={order as string} />
                    </div>
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
            {(error && (
              <tr className="h-[57px]">
                <td
                  className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
                  colSpan={100}
                >
                  <ErrorMessage
                    icons={<FaInbox />}
                    message="An error occurred"
                    mutedText="Please try again later"
                  />
                </td>
              </tr>
            )) ||
              !keys ||
              (keys?.length === 0 && (
                <tr className="h-[57px]">
                  <td
                    className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
                    colSpan={100}
                  >
                    <ErrorMessage
                      icons={<FaInbox />}
                      message="No access keys"
                      mutedText="Please try again later"
                    />
                  </td>
                </tr>
              ))}

            {!error &&
              keys &&
              keys?.map((key: any) => (
                <AccessKeyRow
                  accessKey={key}
                  key={key?.account_id + key?.public_key}
                  showWhen={showWhen}
                />
              ))}
          </tbody>
        </table>
      </div>
      {keys?.length > 0 && (
        <Paginator count={count} limit={25} pageLimit={200} />
      )}
    </>
  );
};

export default AccessKeysActions;
