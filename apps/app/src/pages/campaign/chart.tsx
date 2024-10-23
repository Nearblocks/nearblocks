import { env } from 'next-runtime-env';
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layouts';
import UserLayout from '@/components/Layouts/UserLayout';
import useAuth from '@/hooks/useAuth';
import Stats from '@/components/Campaign/Advertiser/Stats';
import CampaignStats from '@/components/Campaign/Publisher/Stats';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Meta from '@/components/Layouts/Meta';
import withAuth from '@/stores/withAuth';
import Chart from '@/components/Chart';
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

const ChartPage = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const ogUrl = env('NEXT_PUBLIC_OG_URL');
  const siteUrl = env('NEXT_PUBLIC_SITE_URL');

  const dynamicTitle =
    'Near' + '%20Protocol%20API%20&%20Documentation%20|%20' + 'Nearblocks';
  const thumbnail = `${ogUrl}/thumbnail/basic?brand=near&title=${dynamicTitle}`;

  const metaTitle = 'Near' + ' CAMPAIGN | ' + 'Nearblocks';

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

  const { id: campaignId } = router.query;
  const { data: userData, loading: userDataLoading } = useAuth('/profile');
  const user = userData?.data || null;

  const userRole = user?.role[0]?.name;

  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/campaign/chart`} />
      </Head>
      <UserLayout title="Chart">
        {userDataLoading ? (
          <>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full bg-white dark:bg-black-600 border soft-shadow rounded-xl px-8">
                  <h1 className="text-xl mt-8 text-black">
                    <Skeleton className="h-4" />
                  </h1>
                  <p className="mt-4 mb-8 text-3xl text-gray-500">
                    <Skeleton className="h-4" />
                  </p>
                </div>
                <div className="w-full bg-white dark:bg-black-200 border soft-shadow rounded-xl px-8">
                  <h1 className="text-xl mt-8 text-black">
                    <Skeleton className="h-4" />
                  </h1>
                  <p className="mt-4 mb-8 text-3xl text-gray-500">
                    <Skeleton className="h-4" />
                  </p>
                </div>
                <div className="w-full bg-white dark:bg-black-200 border soft-shadow rounded-xl px-8">
                  <h1 className="text-xl mt-8 text-black">
                    <Skeleton className="h-4" />
                  </h1>
                  <p className="mt-4 mb-8 text-3xl text-gray-500">
                    <Skeleton className="h-4" />
                  </p>
                </div>
              </div>
            </div>

            <div className="block lg:flex lg:space-x-2 mt-8">
              <div className="w-full">
                <Skeleton className="h-[500px] rounded-xl" />
              </div>
            </div>
          </>
        ) : (
          <>
            {userRole === 'advertiser' ? (
              <Stats campaignId={campaignId} isTextHide={true} />
            ) : (
              <CampaignStats campaignId={campaignId} isTextHide={true} />
            )}
            <div className={`md:flex lg:flex-row flex-col mt-8`}>
              <div className="container mx-auto">
                <div className="block bg-white  dark:bg-black-200 border soft-shadow rounded-xl overflow-hidden mb-10">
                  <Chart campaignId={campaignId} />
                </div>
              </div>
            </div>
          </>
        )}
      </UserLayout>
    </Layout>
  );
};

export default withAuth(ChartPage);
