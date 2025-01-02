import Head from 'next/head';
import Layout from '@/components/Layouts';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Export from '@/components/Export';
import { appUrl } from '@/utils/config';
import { GetServerSideProps } from 'next';
import { fetchData } from '@/utils/fetchData';
import { getCookieFromRequest } from '@/utils/libs';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
}> = async (context) => {
  try {
    const { statsDetails, latestBlocks } = await fetchData();
    const { req } = context;
    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

    return {
      props: {
        statsDetails,
        latestBlocks,
        signedAccountId,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
        signedAccountId: null,
      },
    };
  }
};

const ExportData = () => {
  const router = useRouter();
  const { address, type } = router.query as { address: string; type: string };

  const title = type
    ? `Export ${type} Data | Nearblocks`
    : ' Near Protocol Explorer | NearBlocks';

  const onHandleDowload = (blobUrl: string, file: string): void => {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.setAttribute('download', file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <link rel="canonical" href={`${appUrl}/exportdata`} />
      </Head>
      <div className="relative">
        <Export
          id={address}
          onHandleDowload={onHandleDowload}
          exportType={type}
        />
      </div>
    </>
  );
};

ExportData.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);

export default ExportData;
