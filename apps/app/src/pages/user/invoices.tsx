import { env } from 'next-runtime-env';
import dayjs from 'dayjs';
import Head from 'next/head';
import get from 'lodash/get';
import React, { useState, useEffect } from 'react';
import { Tooltip } from '@reach/tooltip';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/stores/withAuth';
import Layout from '@/components/Layouts';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import FaDownload from '@/components/Icons/FaDownload';
import { centsToDollar } from '@/utils/libs';
import useStorage from '@/hooks/useStorage';
import Plan from '@/components/Icons/Plan';
import Pagination, { paginationQueue } from '@/components/Dashboard/Pagination';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Skeleton from '@/components/skeleton/common/Skeleton';

interface QueueItem {
  id: string;
  value: string;
}

interface Invoice {
  id: string;
  number: string;
  customer_email: string;
  amount_due: number;
  subtotal: number;
  total: number;
  period_start: number;
  period_end: number;
  invoice_pdf: string;
  status: string;
  lines: {
    data: Array<{
      period: {
        start: number;
        end: number;
      };
    }>;
  };
}

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
  try {
    const [statsResult, latestBlocksResult] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    return {
      props: {
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const Invoices = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [role] = useStorage('role');
  const ogUrl = env('NEXT_PUBLIC_OG_URL');
  const siteUrl = env('NEXT_PUBLIC_SITE_URL');
  const apiUrl =
    role === 'publisher' ? 'publisher/invoices?' : 'advertiser/invoices?';
  const [url, setUrl] = useState(apiUrl);
  const [previousPageParam, setPreviousPageParam] = useState<QueueItem[]>([]);

  const [nextPageParams, setNextPageParams] = useState<{}>();

  const { enqueue, dequeue, size } = paginationQueue(
    previousPageParam,
    setPreviousPageParam,
  );

  const dynamicTitle = 'Near' + '%20Invoices%20' + 'Nearblocks';
  const thumbnail = `${ogUrl}/thumbnail/basic?brand=near&title=${dynamicTitle}`;

  const metaTitle = 'Near' + ' Invoices | ' + 'Nearblocks';

  const metaDescription = 'Nearblocks' + ' Invoices';

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
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/user/keys`} />
      </Head>
      <UserLayout title="Invoices">
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
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap"
                    >
                      Invoice Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Issue Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold whitespace-nowrap text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="hover:bg-blue-900/5 h-[53px]">
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
                        colSpan={100}
                        className="text-gray-600 dark:text-neargray-10 text-xs text-center py-28"
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
                    <tr key={invoice.id} className="hover:bg-blue-900/5">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:bg-black-600 dark:text-neargray-10 align-top">
                        {invoice.number}
                        {role === 'publisher' && (
                          <Tooltip
                            label={invoice?.customer_email}
                            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 break-words"
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
              isTopPagination={true}
              apiUrl={apiUrl}
              setUrl={setUrl}
              enqueue={enqueue}
              dequeue={dequeue}
              size={size()}
              nextPageParams={nextPageParams}
              setPreviousPageParam={setPreviousPageParam}
              mutate={mutate}
            />
          )}
        </div>
      </UserLayout>
    </Layout>
  );
};

export default withAuth(Invoices);
