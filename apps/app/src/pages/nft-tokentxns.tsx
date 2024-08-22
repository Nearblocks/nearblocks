import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import { ReactElement, useEffect, useState } from 'react';
import { env } from 'next-runtime-env';
import queryString from 'qs';
import Layout from '@/components/Layouts';
import TransfersList from '@/components/Tokens/NFTTransfers';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const status: {
    height: 0;
    sync: true;
  } = syncDetails?.status?.indexers?.events;

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

  const thumbnail = `${ogUrl}/thumbnail/basic?title=Latest%20Near%20NEP-171%20Token%20Transfers&brand=near`;

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
        <meta property="twitter:image" content={thumbnail} />
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
        {loading && <Spinner />}
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
