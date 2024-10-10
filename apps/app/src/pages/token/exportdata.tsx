import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Export from '@/components/Export';
import { GetServerSideProps } from 'next';
import { fetchData } from '@/utils/fetchData';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
}> = async (context) => {
  const {
    query: { keyword = '', query = '', filter = 'all' },
  }: any = context;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  try {
    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    return {
      props: {
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
        searchResultDetails: null,
        searchRedirectDetails: null,
      },
    };
  }
};

const ExportData = () => {
  const router = useRouter();
  const { address } = router.query;

  const title = 'Export Token Transactions Data | Nearblocks';

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
        <link rel="canonical" href={`${appUrl}/token/exportdata`} />
      </Head>
      <div className="relative">
        <Export
          id={address}
          onHandleDowload={onHandleDowload}
          exportType={'tokentransactions'}
        />
      </div>
    </>
  );
};

ExportData.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default ExportData;
