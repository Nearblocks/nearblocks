import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import React, { ReactElement } from 'react';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import QueryString from 'qs';
import List from '@/components/Tokens/NFTList';
import { fetchData } from '@/utils/fetchData';
import { getCookieFromRequest } from '@/utils/libs';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
}> = async (context) => {
  const {
    query: { ...qs },
    req,
  }: any = context;

  const params = { ...qs, order: qs.order || 'desc' };

  const fetchUrl = `nfts?sort=txns_day&per_page=50&${QueryString.stringify(
    params,
  )}`;
  const countUrl = `nfts/count?${QueryString.stringify(params)}`;

  try {
    const [dataResult, dataCountResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher(countUrl),
    ]);
    const { statsDetails, latestBlocks } = await fetchData();
    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const error =
      dataResult.status === 'rejected' || dataCountResult.status === 'rejected';

    return {
      props: {
        data,
        dataCount,
        error,
        statsDetails,
        latestBlocks,
        signedAccountId,
      },
    };
  } catch (error) {
    console.error('Error fetching NFT tokens:', error);

    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
        signedAccountId: null,
      },
    };
  }
};

const TopNFTTokens = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20NEP-171%20Tokens&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${
            network === 'testnet' ? 'TESTNET' : ''
          } Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks`}
        </title>
        <meta
          name="title"
          content="Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks"
        />
        <meta
          name="description"
          content="The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks"
        />
        <meta
          property="og:title"
          content="Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks"
        />
        <meta
          property="og:description"
          content="The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks"
        />
        <meta
          property="twitter:title"
          content="Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks"
        />
        <meta
          property="twitter:description"
          content="The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks"
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/nft-tokens`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              Non-Fungible Token Tracker (NEP-171)
            </h1>
          </div>
        </div>
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

TopNFTTokens.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);
export default TopNFTTokens;
