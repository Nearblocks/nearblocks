import { env } from 'next-runtime-env';
import dayjs from 'dayjs';
import Head from 'next/head';
import get from 'lodash/get';
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/stores/withAuth';
import Layout from '@/components/Layouts';
import CopyIcon from '@/components/Icons/CopyIcon';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import Plan from '@/components/Icons/Plan';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Pagination, { paginationQueue } from '@/components/Dashboard/Pagination';
import useStorage from '@/hooks/useStorage';

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

interface ApiKey {
  id: string;
  name: string;
  token: string;
  created_at: string;
  usage: string;
  user: {
    email: string;
    username: string;
  };
}

interface QueueItem {
  id: string;
  value: string;
}

const APIKeys = ({
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

  const apiUrl = role === 'publisher' ? '/publisher/list-all-keys?' : '';
  const [url, setUrl] = useState(apiUrl);

  const [previousPageParam, setPreviousPageParam] = useState<QueueItem[]>([]);

  const [nextPageParams, setNextPageParams] = useState<{}>();

  const { enqueue, dequeue, size } = paginationQueue(
    previousPageParam,
    setPreviousPageParam,
  );

  const { data, loading, mutate } = useAuth(url);

  const keys = get(data, 'keys') || null;

  useEffect(() => {
    if (keys && keys?.data.length > 0 && data?.has_more) {
      setNextPageParams({
        startingAfter: keys[keys?.data.length - 1]?.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys]);

  const onCopy = async (key: ApiKey) => {
    await navigator.clipboard.writeText(key?.token);
    if (!toast.isActive('copy-key')) {
      toast.success('Copied!', {
        toastId: 'copy-key',
      });
    }
  };

  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/publisher/keys`} />
      </Head>
      <UserLayout title="API Keys">
        <div className="w-full pt-2 pb-3 bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit mb-4">
          <div className="px-5 pt-2 pb-4">
            <p className="text-black dark:text-neargray-10">API Keys</p>
            <p className="text-sm text-gray-600 dark:text-neargray-10 mt-2">
              {role === 'publisher'
                ? `List all api keys`
                : `For developers interested in building applications using our API
              Service, please create an API-Key Token usable for all API
              requests.`}
            </p>
          </div>
          <div className="flex">
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y border-t dark:border-black-200 dark:divide-black-200">
                <thead className="bg-gray-100 dark:bg-black-300 dark:text-neargray-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      APP NAME
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      USER
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      API KEY TOKEN
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs whitespace-nowrap font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Usage (Monthly)
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider"
                    >
                      Action
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
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4 " />
                          <Skeleton className="h-4 w-40 mt-2" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                        <td className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-neargray-10 uppercase tracking-wider">
                          <Skeleton className="h-4" />
                        </td>
                      </tr>
                    ))}
                  {!loading && (!keys || keys?.data.length === 0) && (
                    <tr className="h-[53px]">
                      <td colSpan={100} className="text-gray-600 text-xs">
                        <div className="w-full bg-white dark:bg-black-600 h-fit">
                          <div className="text-center py-28">
                            <div className="mb-4 flex justify-center">
                              <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                                <Plan />
                              </span>
                            </div>
                            <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
                              API Keys Empty
                            </h3>
                            <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-10">
                              No API Key Found
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {keys?.data.map((key: ApiKey) => (
                    <tr key={key.id} className="hover:bg-blue-900/5">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top max-w-52 overflow-hidden text-ellipsis">
                        <Tooltip
                          label={key?.name}
                          className="absolute h-auto max-w-xs bg-black dark:bg-black-200 dark:text-neargray-10 bg-opacity-90 z-10 text-white text-xs p-2 break-words"
                        >
                          <span>{key?.name}</span>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black pt-6 dark:text-neargray-10 align-top max-w-52 overflow-hidden text-ellipsis">
                        <Tooltip
                          label={key?.user?.username}
                          className="absolute h-auto max-w-xs bg-black dark:bg-black-200 dark:text-neargray-10 bg-opacity-90 z-10 text-white text-xs p-2 break-words"
                        >
                          <span>{key?.user?.email}</span>
                        </Tooltip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-green-500 dark:text-green-250 align-top">
                        <div className="flex">
                          <p className="mr-2">{key?.token}</p>
                          <button
                            type="button"
                            onClick={() => onCopy(key)}
                            className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full  p-1 w-5 h-5"
                          >
                            <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-neargray-100">
                          Added on {dayjs(key.created_at).format('YYYY-MM-DD')}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-black dark:text-neargray-10 align-top">
                        {key.usage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex  items-center text-xs text-gray-600 dark:text-neargray-10 align-top">
                        <div className="flex items-center border border-green-500 dark:border-green-250 rounded-md px-2 py-1 hover:bg-neargreen/5 dark:hover:bg-black-200">
                          <Link
                            passHref
                            className="flex items-center"
                            href={{
                              pathname: '/publisher/apiusage',
                              query: { id: key?.id },
                            }}
                          >
                            <p className="text-green-500 dark:text-green-250 cursor-pointer">
                              Stats
                            </p>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {keys && keys?.data.length > 0 && (
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

export default withAuth(APIKeys);
