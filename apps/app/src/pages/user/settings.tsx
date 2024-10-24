import { env } from 'next-runtime-env';
import Head from 'next/head';
import get from 'lodash/get';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import Layout from '@/components/Layouts';
import withAuth from '@/stores/withAuth';
import UserLayout from '@/components/Layouts/UserLayout';
import Meta from '@/components/Layouts/Meta';
import useAuth from '@/hooks/useAuth';
import Delete from '@/components/Dashboard/DeleteAccount';
import UpdateEmail from '@/components/Dashboard/UpdateEmail';
import UpdatePassword from '@/components/Dashboard/UpdatePassword';
import SetPassword from '@/components/Dashboard/SetPassword';

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

const Settings = ({
  statsDetails,
  latestBlocks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const ogUrl = env('NEXT_PUBLIC_OG_URL');
  const siteUrl = env('NEXT_PUBLIC_SITE_URL');
  const { data, loading, mutate } = useAuth('/profile');
  const user = get(data, 'data') || null;

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

  return (
    <Layout latestBlocks={latestBlocks} statsDetails={statsDetails}>
      <Head>
        <title>{metaTitle}</title>
        <Meta
          title={metaTitle}
          description={metaDescription}
          thumbnail={thumbnail}
        />
        <link rel="canonical" href={`${siteUrl}/user/settings`} />
      </Head>
      <UserLayout title="Account Settings">
        <div>
          <UpdateEmail user={user} loading={loading} mutate={mutate} />
        </div>
        <div>
          {user?.has_password ? (
            <UpdatePassword />
          ) : (
            <SetPassword mutate={mutate} />
          )}
        </div>
        <div>
          <Delete />
        </div>
      </UserLayout>
    </Layout>
  );
};

export default withAuth(Settings);
