import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import { ReactElement } from 'react';
import { env } from 'next-runtime-env';
import queryString from 'qs';
import Layout from '@/components/Layouts';
import TransfersList from '@/components/Tokens/NFTTransfers';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  syncDetails: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
}> = async (context) => {
  const { query } = context;
  const apiUrl = 'nfts/txns';
  const fetchUrl = query
    ? `nfts/txns?${queryString.stringify(query)}`
    : `${apiUrl}`;

  try {
    const [
      dataResult,
      dataCountResult,
      syncResult,
      statsResult,
      latestBlocksResult,
    ] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('nfts/txns/count'),
      fetcher(`sync/status`),
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const syncDetails =
      syncResult.status === 'fulfilled' ? syncResult.value : null;
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
        syncDetails,
        error,
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching nftTransfers:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        syncDetails: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const NftToxenTxns = ({
  data,
  dataCount,
  syncDetails,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();

  const status: {
    height: 0;
    sync: true;
  } = syncDetails?.status?.indexers?.events;

  const thumbnail = `${ogUrl}/og?title=Latest%20Near%20NEP-171%20Token%20Transfers&brand=near&basic=true`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'token:nfts.metaTitle',
          )} `}
        </title>
        <meta name="title" content={t('token:nfts.metaTitle')} />
        <meta name="description" content={t('token:nfts.metaDescription')} />
        <meta property="og:title" content={t('token:nfts.metaTitle')} />
        <meta
          property="og:description"
          content={t('token:nfts.metaDescription')}
        />
        <meta property="twitter:title" content={t('token:nfts.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('token:nfts.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta name="twitter:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/nft-tokentxns`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              {t ? t('token:nfts.heading') : 'Non-Fungible Token Transfers'}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <TransfersList
                data={data}
                totalCount={dataCount}
                error={error}
                status={status}
              />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};
NftToxenTxns.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);
export default NftToxenTxns;
