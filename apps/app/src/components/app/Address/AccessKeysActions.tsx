'use client';
import { useState } from 'react';
import SortIcon from '../Icons/SortIcon';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import Paginator from '../common/Paginator';
import { AccountContractInfo } from '@/utils/types';
import AccessKeyRow from './AccessKeyRow';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';

interface Props {
  keys: AccountContractInfo[];
  count: number;
  error: boolean;
  tab?: string;
}

const AccessKeysActions = ({ keys, count, error }: Props) => {
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
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Txn Hash
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Public key
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Access
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Contract
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Method
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Allowance
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                Action
              </th>
              <th scope="col" className="text-left whitespace-nowrap">
                <div className="w-full inline-flex px-4 py-4">
                  <button
                    type="button"
                    onClick={toggleShowWhen}
                    className="text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-600 dark:text-neargray-10 focus:outline-none"
                  >
                    {showWhen ? 'When' : 'Date Time (UTC)'}
                  </button>
                  <button type="button" onClick={onOrder} className="px-2">
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
                  colSpan={100}
                  className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
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
                    colSpan={100}
                    className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
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
                  key={key?.account_id + key?.public_key}
                  accessKey={key}
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
