import { env } from 'next-runtime-env';
import React from 'react';
import Head from 'next/head';
import get from 'lodash/get';
import dayjs from '../../utils/dayjs';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/stores/withAuth';
import Link from 'next/link';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Layout from '@/components/Layouts';
import Avatar from '@/components/Icons/Avatar';
import EmailCircle from '@/components/Icons/EmailCircle';
import LoginCircle from '@/components/Icons/LoginCircle';
import Clock from '@/components/Icons/Clock';
import Edit from '@/components/Icons/Edit';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import Skeleton from '@/components/skeleton/common/Skeleton';

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

const Overview = ({
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

  const { data, loading } = useAuth('/profile');
  const user = get(data, 'data') || null;
  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/user/overview`} />
      </Head>
      <UserLayout title="Account Overview">
        <div className="w-full bg-white dark:bg-black-600 rounded-xl soft-shadow h-fit">
          <div className="border-b px-5 py-5 dark:border-black-200">
            <p className="text-black dark:text-neargray-100">
              Personal Information
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-neargray-100 mt-2 px-6 py-4">
              Below are the username, emali address and overview information of
              your account
            </p>
            <div className="grid grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
              <p className="text-gray-600 dark:text-neargray-100 text-sm flex items-center">
                <Avatar /> <span className="ml-2">Username</span>
              </p>
              {loading ? (
                <div className="w-full md:w-1/5">
                  <Skeleton className="flex w-20 h-4" />
                </div>
              ) : (
                <p className="text-sm text-black dark:text-neargray-100 font-bold">
                  {user?.username}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 items-center px-6 py-4  border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-100 text-sm flex items-center">
              <EmailCircle /> <span className="ml-2">Email Address</span>
            </p>
            {loading ? (
              <div className="w-full md:w-1/5">
                <Skeleton className="flex w-26 h-4" />
              </div>
            ) : (
              <>
                <p className="text-sm text-black dark:text-neargray-100 font-bold">
                  {user?.email}
                </p>
                <div className=" flex justify-end">
                  <Link legacyBehavior href={`/user/settings`}>
                    <div className="w-1/3 flex justify-center	items-center text-center border-2 text-md pl-4 pr-6 py-1 rounded focus:outline-none font-semibold hover:bg-green-400 bg-green-500 text-white border-green cursor-pointer">
                      <Edit className="h-3 w-3 " />
                      <span className="text-[13px] font-semibold ml-2">
                        Edit
                      </span>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1 items-center px-6 py-4 border-b dark:border-black-200">
            <p className="text-gray-600 dark:text-neargray-100 text-sm flex items-center">
              <LoginCircle /> <span className="ml-2">Last Login</span>
            </p>
            {loading ? (
              <div className="w-full md:w-1/5">
                <Skeleton className="flex w-20 h-4" />
              </div>
            ) : (
              <p className="text-sm text-black dark:text-neargray-100 flex col-span-2">
                <Clock className="my-auto mr-1" />
                {dayjs(user?.last_login_at).format('YYYY-MM-DD  HH:mm:ss')}
              </p>
            )}
          </div>
        </div>
      </UserLayout>
    </Layout>
  );
};

export default withAuth(Overview);
