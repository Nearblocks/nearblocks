import { env } from 'next-runtime-env';
import React from 'react';
import Head from 'next/head';
import Stats from '@/components/Campaign/Advertiser/Stats';
import CampaignStats from '@/components/Campaign/Publisher/Stats';
import withAuth from '@/stores/withAuth';
import UserLayout from '@/components/Layouts/UserLayout';
import Layout from '@/components/Layouts';
import useStorage from '@/hooks/useStorage';
import Meta from '@/components/Layouts/Meta';
import useAuth from '@/hooks/useAuth';
import Listing from '@/components/Campaign/Advertiser/Listing';
import CampaignListing from '@/components/Campaign/Publisher/Listing';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';

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

const Campaign = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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

  const [userRole] = useStorage('role');

  const { mutate: statsMutate } = useAuth('advertiser/stats');

  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/campaign`} />
      </Head>
      {userRole === 'advertiser' ? (
        <UserLayout title="My Campaigns">
          <div>
            <Stats statsMutate={statsMutate} />
          </div>
          <div className="my-campaigns">
            <div className="mt-8">
              <div>
                <Listing statsMutate={statsMutate} />
              </div>
            </div>
          </div>
        </UserLayout>
      ) : (
        <UserLayout title="Campaigns">
          <div>
            <CampaignStats />
          </div>
          <div className="campaigns">
            <div className="mt-8">
              <div>
                <CampaignListing />
              </div>
            </div>
          </div>
        </UserLayout>
      )}
    </Layout>
  );
};

export default withAuth(Campaign);
