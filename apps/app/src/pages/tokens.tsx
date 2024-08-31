import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import QueryString from 'qs';
import List from '@/components/Tokens/FTList';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
}> = async ({ query }) => {
  const params = { ...query, order: query.order || 'desc' };
  const fetchUrl = `fts?sort=onchain_market_cap&per_page=50&${QueryString.stringify(
    params,
  )}`;
  const countUrl = `fts/count?${QueryString.stringify(params)}`;

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
    const error =
      dataResult.status === 'rejected' || dataCountResult.status === 'rejected';
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
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching FT tokens:', error);

    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const TopFTTokens = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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

  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20NEP-141%20Tokens&brand=near`;
  return (
    <>
      <Head>
        <title>
          {`${
            network === 'testnet' ? 'TESTNET' : ''
          } Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks`}
        </title>
        <meta
          name="title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          name="description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta
          property="og:title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          property="og:description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta
          property="twitter:title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          property="twitter:description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/tokens`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              Near Protocol Ecosystem Tokens (NEP-141)
            </h1>
          </div>
        </div>
        {loading && <Spinner />}
        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <List data={data} tokensCount={dataCount} error={error} />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};

TopFTTokens.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default TopFTTokens;
