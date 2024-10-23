import { env } from 'next-runtime-env';
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layouts';
import withAuth from '@/stores/withAuth';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Chart from '@/components/ApiUsage/Chart';

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

const ApiUsage = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
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

  const { id: keyId } = router.query;

  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/publisher/apiusage`} />
      </Head>
      <UserLayout title="Api Key Usage">
        <>
          <div className={`md:flex lg:flex-row flex-col`}>
            <div className="container mx-auto">
              <div className="block bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden mb-10">
                <Chart keyId={keyId} />
              </div>
            </div>
          </div>
        </>
      </UserLayout>
    </Layout>
  );
};

export default withAuth(ApiUsage);
