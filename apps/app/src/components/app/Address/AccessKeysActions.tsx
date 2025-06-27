'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { use, useState } from 'react';
import { AccountContractInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import Paginator from '@/components/app/common/Paginator';
import FaInbox from '@/components/app/Icons/FaInbox';
import SortIcon from '@/components/app/Icons/SortIcon';
import AccessKeyRow from '@/components/app/Address/AccessKeyRow';
import { useAddressRpc } from '../common/AddressRpcProvider';

interface Props {
  dataPromise: Promise<any>;
  countPromise: Promise<any>;
}

const AccessKeysActions = ({ dataPromise, countPromise }: Props) => {
  const data = use(dataPromise);
  const countData = use(countPromise);
  const count = countData?.keys?.[0]?.count;
  const error = !data || data?.message === 'Error';
  const keys: AccountContractInfo[] = data?.keys;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [showWhen, setShowWhen] = useState(true);
  const toggleShowWhen = () => setShowWhen((s) => !s);
  const { accessKeys, isLoading } = useAddressRpc();

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
  };

  const accessKeysInfo = keys || (accessKeys ?? []);
  const accessKeysCount = Number(count) || (accessKeys ?? [])?.length;

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
            {accessKeysCount === 0 ? (
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
            ) : (
              error &&
              !isLoading &&
              !accessKeysCount && (
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
              )
            )}
            {accessKeysInfo &&
              accessKeysInfo?.map((key: any) => (
                <AccessKeyRow
                  error={error}
                  accessKey={key}
                  key={key?.account_id + key?.public_key}
                  showWhen={showWhen}
                />
              ))}
          </tbody>
        </table>
      </div>
      {accessKeysCount > 0 && (
        <Paginator count={accessKeysCount} limit={25} pageLimit={200} />
      )}
    </>
  );
};

export default AccessKeysActions;
