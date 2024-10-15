import { env } from 'next-runtime-env';
import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { appUrl } from '@/utils/config';
import Layout from '@/components/Layouts';
import Verifier from '@/components/Address/Contract/Verifier';
import { GetServerSideProps } from 'next';
import { fetchData } from '@/utils/fetchData';

const network = env('NEXT_PUBLIC_NETWORK_ID') || '';
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
  try {
    const { statsDetails, latestBlocks } = await fetchData();

    return {
      props: {
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const VerifyContract = () => {
  const router = useRouter();
  const { accountId, selectedVerifier } = router.query;

  const thumbnail = `${ogUrl}/thumbnail/basic?title=Verify-contract&brand=near`;

  return (
    <>
      <Head>
        <title>{`${
          network === 'testnet' ? 'TESTNET ' : ''
        }Verify Contract | Nearblocks`}</title>
        <meta name="title" content="Verify Contract | Nearblocks" />
        <meta
          name="description"
          content="Verify a smart contract on the blockchain."
        />
        <meta property="og:title" content="Verify Contract" />
        <meta
          property="og:description"
          content="Verify a smart contract on the blockchain."
        />
        <meta property="twitter:title" content="Verify Contract | Nearblocks" />
        <meta
          property="twitter:description"
          content="Verify a smart contract on the blockchain."
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/verify-contract`} />
      </Head>
      <div className="h-80"></div>
      <div className="container mx-auto px-3 md:px-14 flex flex-col items-center mt-[-300px]">
        <div className="md:flex items-center justify-center container mx-auto px-3">
          <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 pt-5 pb-2 w-full text-center">
            Verify & Publish Contract Source Code
          </h1>
        </div>
        <div className="w-full max-w-3xl items-center mt-8 space-y-6">
          <Verifier
            accountId={accountId as string}
            selectedVerifier={selectedVerifier as string}
            network={network}
          />
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

VerifyContract.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default VerifyContract;
