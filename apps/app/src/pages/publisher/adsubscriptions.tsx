import { env } from 'next-runtime-env';
import dayjs from 'dayjs';
import Head from 'next/head';
import get from 'lodash/get';
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@reach/tooltip';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/stores/withAuth';
import Layout from '@/components/Layouts';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import Plan from '@/components/Icons/Plan';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Pagination, { paginationQueue } from '@/components/Dashboard/Pagination';
import useStorage from '@/hooks/useStorage';
import SubscriptionStats from '@/components/SubscriptionStats';
import { dollarFormat } from '@/utils/libs';

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

interface QueueItem {
  id: string;
  value: string;
}

const AdSubscriptions = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const ogUrl = env('NEXT_PUBLIC_OG_URL');
  const siteUrl = env('NEXT_PUBLIC_SITE_URL');
  const dynamicTitle =
    'Near' + '%20Protocol%20API%20&%20Documentation%20|%20' + 'Nearblocks';
  const thumbnail = `${ogUrl}/thumbnail/basic?brand=near&title=${dynamicTitle}`;

  const metaTitle = 'Near' + ' API | ' + 'Nearblocks';

  const metaDescription =
    'Nearblocks' +
    ' APIs derives data from ' +
    'Nearblocks' +
    ' ' +
    'Near' +
    ' Protocol (' +
    'Near' +
    ') Block Explorer to cater for ' +
    'Near' +
    ' Protocol applications through API Endpoints.';

  const [role] = useStorage('role');
  const apiUrl =
    role === 'publisher' ? '/publisher/campaign-subscriptions?' : '';
  const [url, setUrl] = useState(apiUrl);
  const [previousPageParam, setPreviousPageParam] = useState<QueueItem[]>([]);
  const [nextPageParams, setNextPageParams] = useState<{}>();

  const { enqueue, dequeue, size } = paginationQueue(
    previousPageParam,
    setPreviousPageParam,
  );

  const { data, loading, mutate } = useAuth(url);

  const subscriptions = get(data, 'data') || null;

  useEffect(() => {
    if (subscriptions && subscriptions?.length > 0 && data?.has_more) {
      setNextPageParams({
        startingAfter: subscriptions[subscriptions?.length - 1]?.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions]);

  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/publisher/adsubscriptions`} />
      </Head>
      <UserLayout title="Campaign Subscriptions">
        <SubscriptionStats />
        <div className="w-full pt-2 pb-3 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4 mt-8">
          <div className="px-5 pt-2 pb-4">
            <p className="text-black dark:text-neargray-10">
              Campaign Subscriptions
            </p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              List all campaign subscriptions
            </p>
          </div>
          <div className="flex">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y border-t dark:border-black-200 dark:divide-black-200">
                <thead className="bg-gray-100 dark:bg-black-300 dark:text-neargray-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      USER
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      PLAN
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      PRICE
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      START DATE
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      END DATE
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black-600 divide-y divide-gray-200 dark:divide-black-200">
                  {loading &&
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="hover:bg-blue-900/5 h-[53px]">
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading &&
                    (!subscriptions || subscriptions?.length === 0) && (
                      <tr className="h-[53px]">
                        <td colSpan={100} className="text-gray-400 text-xs">
                          <div className="w-full bg-white dark:bg-black-600 h-fit">
                            <div className="text-center py-28">
                              <div className="mb-4 flex justify-center">
                                <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                  <Plan />
                                </span>
                              </div>
                              <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                                Campaign Subscriptions Empty
                              </h3>
                              <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
                                No Campaign Subscriptions Found
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  {subscriptions &&
                    subscriptions?.map((key: any) => (
                      <tr key={key.id} className="hover:bg-blue-900/5">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top max-w-52 overflow-hidden text-ellipsis">
                          <Tooltip
                            label={key?.user_email}
                            className="absolute h-auto max-w-xs bg-black dark:bg-black-200 dark:text-neargray-10 bg-opacity-90 z-10 text-white text-xs p-2 break-words"
                          >
                            <span>{key?.user_email}</span>
                          </Tooltip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-green-500 dark:text-green-250 align-top">
                          <div className="flex">
                            <p className="mr-2">{key?.campaign_plan_title}</p>
                          </div>
                        </td>
                        {key?.subscription_type === 'monthly' ? (
                          <td className="px-5 py-4 whitespace-nowrap text-sm ">
                            <span className="text-xs">
                              ${dollarFormat((key?.price / 100).toString())}
                              /mo
                            </span>
                          </td>
                        ) : (
                          <td className="px-5 py-4 whitespace-nowrap text-sm ">
                            <span className="text-xs">
                              ${dollarFormat((key?.price / 100).toString())}/yr
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top">
                          {dayjs(key.start_date).format('YYYY-MM-DD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top">
                          {dayjs(key.end_date).format('YYYY-MM-DD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top">
                          {key.status}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          {subscriptions && subscriptions?.length > 0 && (
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

export default withAuth(AdSubscriptions);
