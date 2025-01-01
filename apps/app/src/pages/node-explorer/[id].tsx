import Head from 'next/head';
import { useRouter } from 'next/router';
import { appUrl } from '@/utils/config';
import Layout from '@/components/Layouts';
import { ReactElement } from 'react';
import { env } from 'next-runtime-env';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Buttons from '@/components/Address/Buttons';
import Delegators from '@/components/NodeExplorer/Delegators';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { fetchData } from '@/utils/fetchData';
import { getCookieFromRequest } from '@/utils/libs';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const RpcMenu = dynamic(() => import('../../components/Layouts/RpcMenu'), {
  ssr: false,
});

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

const Delegator = () => {
  const router = useRouter();
  const { id }: any = router.query;

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    id ? `${id}: ` : ''
  } delegators | NearBlocks`;
  const description = id
    ? `Node Validator ${id} (${id}) Delegators Listing`
    : '';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <link rel="canonical" href={`${appUrl}/node-explorer/${id}`} />
      </Head>
      <div className="container relative mx-auto p-3">
        <div className="flex justify-between items-center">
          {!id ? (
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>
          ) : (
            <>
              <div className="break-all py-4 px-2">
                <span className="py-5 text-xl text-gray-700 leading-8 dark:text-neargray-10 mr-1">
                  <span className="whitespace-nowrap">
                    Near Validator:&nbsp;
                  </span>
                  <span className="text-center items-center">
                    <span className="text-green-500 dark:text-green-250">
                      @<span className="font-semibold">{id}</span>
                    </span>
                    <span className="ml-2">
                      <Buttons address={id} />
                    </span>
                  </span>
                </span>
              </div>

              <ul className="flex relative md:pt-0 pt-2 items-center text-gray-500 text-xs">
                <RpcMenu />
              </ul>
            </>
          )}
        </div>
        <div>
          <Delegators accountId={id} />
        </div>
      </div>
    </>
  );
};
Delegator.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);
export default Delegator;
