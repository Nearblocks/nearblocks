import { useState } from 'react';
import SortIcon from '../Icons/SortIcon';
import Skeleton from '../skeleton/common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import Paginator from '../common/Paginator';
import { useRouter } from 'next/router';
import AccessKeyRow from './AccessKeyRow';

const AccessKeys = () => {
  const router = useRouter();
  const [showWhen, setShowWhen] = useState(true);

  const keys = data?.keys || [];
  const count = countData?.keys?.[0]?.count || 0;

  const toggleShowWhen = () => setShowWhen((s) => !s);

  const setPage = (page: any) => {
    if (typeof page === 'function') {
      return setPagination((state) => ({ ...state, page: page(state.page) }));
    }

    return setPagination('page', page);
  };

  const onOrder = () => {
    resetPagination();
    setSorting((state) => ({
      ...state,
      order: state.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <>
      <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
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
                        <SortIcon order={sorting.order} />
                      </div>
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
              {loading &&
                [...Array(25)].map((_, i) => (
                  <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-tiny ">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton className="w-full h-4" />
                    </td>
                  </tr>
                ))}
              {!loading && keys?.length === 0 && (
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
              )}
              {!loading &&
                keys &&
                keys.map((key: any) => (
                  <AccessKeyRow
                    key={key.account_id + key.public_key}
                    accessKey={key}
                    showWhen={showWhen}
                  />
                ))}
            </tbody>
          </table>
        </div>
        {keys.length > 0 && (
          <Paginator
            count={count}
            page={page}
            limit={25}
            pageLimit={200}
            setPage={setPage}
          />
        )}
      </div>
    </>
  );
};
export default AccessKeys;
