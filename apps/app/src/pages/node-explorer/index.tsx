import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { ReactElement } from 'react';
import { env } from 'next-runtime-env';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import queryString from 'qs';
import fetcher from '@/utils/fetcher';
import NodeList from '@/components/NodeExplorer/NodeList';

const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  totalSupply: any;
  latestBlock: any;
  error: boolean;
  statsDetails: any;
}> = async (context) => {
  const { query } = context;
  const fetchUrl = `validators?${queryString.stringify(query)}`;
  const totalSupplyUrl = `stats`;
  const latestBlockUrl = `blocks/latest?limit=1`;
  try {
    const [dataResult, totalSupplyResult, latestBlockResult, statsResult] =
      await Promise.allSettled([
        fetcher(fetchUrl),
        fetcher(totalSupplyUrl),
        fetcher(latestBlockUrl),
        fetcher(`stats`),
      ]);
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const totalSupply =
      totalSupplyResult.status === 'fulfilled' ? totalSupplyResult.value : null;
    const latestBlock =
      latestBlockResult.status === 'fulfilled' ? latestBlockResult.value : null;
    const error = dataResult.status === 'rejected';
    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;

    return {
      props: {
        data,
        totalSupply,
        latestBlock,
        error,
        statsDetails,
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
        statsDetails: null,
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
        <meta name="twitter:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/node-explorer`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
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
NodeExplorer.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlock}
  >
    {page}
  </Layout>
);
export default NodeExplorer;
