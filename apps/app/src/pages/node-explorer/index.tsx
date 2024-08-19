import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { ReactElement, useEffect, useState } from 'react';
import { env } from 'next-runtime-env';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import queryString from 'qs';
import fetcher from '@/utils/fetcher';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';
import NodeList from '@/components/NodeExplorer/NodeList';

const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  totalSupply: any;
  latestBlock: any;
  error: boolean;
}> = async (context) => {
  const { query } = context;
  const fetchUrl = `validators?${queryString.stringify(query)}`;
  const totalSupplyUrl = `stats`;
  const latestBlockUrl = `blocks/latest?limit=1`;
  try {
    const [dataResult, totalSupplyResult, latestBlockResult] =
      await Promise.allSettled([
        fetcher(fetchUrl),
        fetcher(totalSupplyUrl),
        fetcher(latestBlockUrl),
      ]);
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const totalSupply =
      totalSupplyResult.status === 'fulfilled' ? totalSupplyResult.value : null;
    const latestBlock =
      latestBlockResult.status === 'fulfilled' ? latestBlockResult.value : null;
    const error = dataResult.status === 'rejected';
    return {
      props: {
        data,
        totalSupply,
        latestBlock,
        error,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        data: null,
        totalSupply: null,
        error: true,
        latestBlock: null,
      },
    };
  }
};

const NodeExplorer = ({
  data,
  totalSupply,
  latestBlock,
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

  const title = 'NEAR Validator List | Nearblocks';
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20Validator%20Explorer&brand=near`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/node-explorer`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
      {loading && <Spinner />}
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative">
          <NodeList
            data={data}
            totalSupply={totalSupply}
            latestBlock={latestBlock}
            error={error}
          />
        </div>
      </div>
    </>
  );
};
NodeExplorer.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default NodeExplorer;
