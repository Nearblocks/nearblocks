import { ReactElement } from 'react';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import Layout from '@/components/Layouts';
import List from '@/components/Blocks/List';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { env } from 'next-runtime-env';
import { appUrl } from '@/utils/config';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import { fetchData } from '@/utils/fetchData';
import { getCookieFromRequest } from '@/utils/libs';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
}> = async (context) => {
  const {
    query: { keyword = '', filter = 'all', query = '', ...qs },
    req,
  }: any = context;

  const apiUrl = 'blocks';
  const fetchUrl = qs ? `blocks?${queryString.stringify(qs)}` : `${apiUrl}`;

  try {
    const [dataResult, dataCountResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('blocks/count'),
    ]);
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const error = dataResult.status === 'rejected';

    const { statsDetails, latestBlocks } = await fetchData();
    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

    return {
      props: {
        data,
        dataCount,
        error,
        apiUrl,
        statsDetails,
        latestBlocks,
        signedAccountId,
      },
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        apiUrl: '',
        statsDetails: null,
        latestBlocks: null,
        signedAccountId: null,
      },
    };
  }
};

const Blocks = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    t('blocks:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:metaTitle',
          )} `}
        </title>
        <meta name="title" content={t('blocks:metaTitle')} />
        <meta name="description" content={t('blocks:metaDescription')} />
        <meta property="og:title" content={t('blocks:metaTitle')} />
        <meta property="og:description" content={t('blocks:metaDescription')} />
        <meta property="twitter:title" content={t('blocks:metaTitle')} />
        <meta property="og:image" content={thumbnail} />
        <meta name="twitter:image" content={thumbnail} />
        <meta
          property="twitter:description"
          content={t('blocks:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/blocks`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('blocks:heading') : 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <List data={data} totalCount={dataCount} error={error} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

Blocks.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);

export default Blocks;
