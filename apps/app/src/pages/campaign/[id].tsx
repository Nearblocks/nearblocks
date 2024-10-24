import { env } from 'next-runtime-env';
import { useRouter } from 'next/router';
import Head from 'next/head';
import withAuth from '@/stores/withAuth';
import useAuth from '@/hooks/useAuth';
import Layout from '@/components/Layouts';
import UserLayout from '@/components/Layouts/UserLayout';
import useStorage from '@/hooks/useStorage';
import Meta from '@/components/Layouts/Meta';
import CircularLoader from '@/components/skeleton/common/CircularLoader';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Stats from '@/components/Campaign/Advertiser/Stats';
import CampaignStats from '@/components/Campaign/Publisher/Stats';
import BannerAdForm from '@/components/Campaign/BannerAdForm';
import TextAdForm from '@/components/Campaign/TextAdForm';

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

const EditCampaign = ({
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

  const router = useRouter();
  const { id: campaignId } = router.query;

  const { mutate } = useAuth('/campaign/subscription-info');

  const {
    data: campaignData,
    mutate: campaignMutate,
    loading,
  } = useAuth(`/campaigns/${campaignId}`);

  const [userRole] = useStorage('role');
  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>

        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/campaign/${campaignId}`} />
      </Head>
      <UserLayout title="Edit campaign type">
        <>
          <div>
            {userRole === 'advertiser' ? (
              <Stats campaignId={campaignId} />
            ) : (
              <CampaignStats campaignId={campaignId} />
            )}
          </div>
          <div className={` mt-8`}>
            {loading ? (
              <div className="h-1/2 flex items-center justify-center py-48">
                <CircularLoader />
              </div>
            ) : campaignData &&
              (campaignData?.data?.title === 'Text slots' ||
                campaignData?.data?.title === 'Placeholder Text Ad') ? (
              <TextAdForm
                campaignId={campaignId}
                campaignData={campaignData}
                campaignMutate={campaignMutate}
                mutate={mutate}
                loading={loading}
              />
            ) : (
              <BannerAdForm
                campaignId={campaignId}
                campaignData={campaignData}
                campaignMutate={campaignMutate}
                mutate={mutate}
                loading={loading}
              />
            )}
          </div>
        </>
      </UserLayout>
    </Layout>
  );
};
export default withAuth(EditCampaign);
