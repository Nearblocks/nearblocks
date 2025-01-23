import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { ReactElement, useEffect } from 'react';
import { env } from 'next-runtime-env';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import queryString from 'qs';
import fetcher from '@/utils/fetcher';
import NodeList from '@/components/NodeExplorer/NodeList';
import dynamic from 'next/dynamic';
import { useRpcStore } from '@/stores/rpc';
import { useRouter } from 'next/router';
import { fetchData } from '@/utils/fetchData';
import { getCookieFromRequest } from '@/utils/libs';
import { IncomingMessage } from 'http';
import { QueryParams } from '@near-wallet-selector/core/src/lib/services';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const RpcMenu = dynamic(() => import('../../components/Layouts/RpcMenu'), {
  ssr: false,
});

export const getServerSideProps: GetServerSideProps<{
  data: any;
  latestBlock: any;
  error: boolean;
  statsDetails: any;
  signedAccountId: any;
}> = async (context) => {
  const {
    query,
    req,
  }: {
    query: QueryParams;
    req: IncomingMessage;
  } = context;
  const fetchUrl = `validators?${queryString.stringify(query)}`;

  try {
    const [dataResult] = await Promise.allSettled([fetcher(fetchUrl)]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const error = dataResult.status === 'rejected';

    const { statsDetails, latestBlocks } = await fetchData();
    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

    return {
      props: {
        data,
        latestBlock: latestBlocks,
        error,
        statsDetails,
        signedAccountId,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        data: null,
        error: true,
        latestBlock: null,
        statsDetails: null,
        signedAccountId: null,
      },
    };
  }
};

const NodeExplorer = ({
  data,
  statsDetails,
  latestBlock,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const title = 'NEAR Validator List | Nearblocks';
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20Validator%20Explorer&brand=near`;

  useEffect(() => {
    router.replace(router.asPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcUrl]);

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
        <div className="container mx-auto px-3 flex justify-between items-center">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
          <ul className="flex relative mb-2 pt-8 items-center text-gray-500 text-xs">
            <RpcMenu />
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative">
          <NodeList
            data={data}
            totalSupply={statsDetails}
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
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);
export default NodeExplorer;
