'use client';
import dayjs from 'dayjs';
import get from 'lodash/get';
import React, { useEffect, useState } from 'react';

import Pagination, {
  paginationQueue,
} from '@/components/app/Dashboard/Pagination';
import FaDownload from '@/components/app/Icons/FaDownload';
import Plan from '@/components/app/Icons/Plan';
import UserLayout from '@/components/app/Layouts/UserLayout';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import useAuth from '@/hooks/app/useAuth';
import { centsToDollar } from '@/utils/app/libs';

import Tooltip from '../common/Tooltip';
import withAuth from '../stores/withAuth';

interface QueueItem {
  id: string;
  value: string;
}

interface Invoice {
  amount_due: number;
  customer_email: string;
  id: string;
  invoice_pdf: string;
  lines: {
    data: Array<{
      period: {
        end: number;
        start: number;
      };
    }>;
  };
  number: string;
  period_end: number;
  period_start: number;
  status: string;
  subtotal: number;
  total: number;
}

const Invoice = ({ role }: { role?: string }) => {
  const apiUrl =
    role === 'publisher' ? 'publisher/invoices?' : 'advertiser/invoices?';
  const [url, setUrl] = useState(apiUrl);
  const [previousPageParam, setPreviousPageParam] = useState<QueueItem[]>([]);

  const [nextPageParams, setNextPageParams] = useState<{}>();

  const { dequeue, enqueue, size } = paginationQueue(
    previousPageParam,
    setPreviousPageParam,
  );
  const { data, loading, mutate } = useAuth(url);

  const invoices = get(data, 'data') || null;

  useEffect(() => {
    if (invoices && invoices.length > 0 && data?.has_more) {
      setNextPageParams({
        startingAfter: invoices[invoices.length - 1]?.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices]);

  return (
    <>
      <UserLayout role={role} title="Invoices">
        <div className="w-full pt-2 pb-3 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit">
          <div className="px-5 pt-2 pb-4">
            <p className="text-black dark:text-neargray-10">Invoices</p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              List all invoices
            </p>
          </div>
          <div className="flex">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y border-t dark:border-black-200 dark:divide-black-200">
                <thead className="bg-gray-100 dark:bg-black-300">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                      scope="col"
                    >
                      Invoice Number
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Amount
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Subtotal
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Total
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Issue Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Due Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                      scope="col"
                    >
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <tr className="hover:bg-blue-900/5 h-[53px]" key={i}>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-50 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading && (!invoices || invoices?.length < 1) && (
                    <tr className="h-[53px]">
                      <td
                        className="text-gray-600 dark:text-neargray-10 text-xs text-center py-28"
                        colSpan={100}
                      >
                        <div className="mb-4 flex justify-center">
                          <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                            <Plan />
                          </span>
                        </div>
                        <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                          Invoices Empty
                        </h3>
                        <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
                          No Invoice Found
                        </p>
                      </td>
                    </tr>
                  )}

                  {invoices?.map((invoice: Invoice) => (
                    <tr className="hover:bg-blue-900/5" key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        {invoice.number}
                        {role === 'publisher' && (
                          <Tooltip
                            className={'left-1/2 max-w-[200px]'}
                            position="top"
                            tooltip={invoice?.customer_email}
                          >
                            <div className="w-20">
                              <p className="truncate text-ellipsis overflow-hidden">
                                <>{invoice?.customer_email}</>
                              </p>
                            </div>
                          </Tooltip>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs dark:bg-black-600 text-green-500 dark:text-green-250 align-top">
                        <div className="flex">
                          <p className="mr-2">
                            ${centsToDollar(invoice?.amount_due)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        ${centsToDollar(invoice?.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        ${centsToDollar(invoice?.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        {dayjs
                          .unix(invoice?.lines?.data[0].period?.start)
                          .format('MMMM D, YYYY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        {dayjs
                          .unix(invoice?.lines?.data[0].period?.end)
                          .format('MMMM D, YYYY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top ml-3">
                        {invoice?.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        <a href={invoice.invoice_pdf}>
                          <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 hover:bg-neargreen/5 dark:hover:bg-black-200">
                            <FaDownload className="text-green-500 dark:text-green-250 " />{' '}
                            <p className="ml-1 text-green-500 dark:text-green-250 cursor-pointer">
                              Download
                            </p>
                          </div>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {invoices && invoices?.length > 0 && (
            <Pagination
              apiUrl={apiUrl}
              dequeue={dequeue}
              enqueue={enqueue}
              isTopPagination={true}
              mutate={mutate}
              nextPageParams={nextPageParams}
              setPreviousPageParam={setPreviousPageParam}
              setUrl={setUrl}
              size={size()}
            />
          )}
        </div>
      </UserLayout>
    </>
  );
};

export default withAuth(Invoice);
