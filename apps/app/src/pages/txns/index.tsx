import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import List from '@/components/Transactions/List';
import Layout from '@/components/Layouts';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  apiUrl: string;
  statsDetails: any;
  latestBlocks: any;
}> = async (context) => {
  const { query } = context;

  const apiUrl = `txns`;
  const fetchUrl = `${apiUrl}?${queryString.stringify(query)}`;
  const countUrl = `txns/count?${queryString.stringify(query)}`;

  try {
    const [dataResult, dataCountResult, statsResult, latestBlocksResult] =
      await Promise.allSettled([
        fetcher(fetchUrl),
        fetcher(countUrl),
        fetcher(`stats`),
        fetcher(`blocks/latest?limit=1`),
      ]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const error = dataResult.status === 'rejected';
    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    return {
      props: {
        data,
        dataCount,
        error,
        apiUrl,
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        apiUrl: '',
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const TransactionList = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleRouteChangeStart = (url: string) => {
      if (url !== router.asPath) {
        timeout = setTimeout(() => {
          setLoading(true);
        }, 300);
      }
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('txns:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('txns:metaTitle')} `}
        </title>
        <meta name="title" content={t('txns:metaTitle')} />
        <meta name="description" content={t('txns:metaDescription')} />
        <meta property="og:title" content={t('txns:metaTitle')} />
        <meta property="og:description" content={t('txns:metaDescription')} />
        <meta property="twitter:title" content={t('txns:metaTitle')} />
        <meta
          property="twitter:description"
          content={t('txns:metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/txns`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('txns:heading') : 'Latest Near Protocol transactions'}
          </h1>
        </div>
      </div>
      {loading && <Spinner />}
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <List txnsData={data} txnsCount={dataCount} error={error} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};
TransactionList.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlock}
  >
    {page}
  </Layout>
);
export default TransactionList;
