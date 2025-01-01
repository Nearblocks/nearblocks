import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import React, { ReactElement, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { env } from 'next-runtime-env';
// import Banner from '@/components/Banner';
// import SponserdText from '@/components/SponserdText';
import LatestBlocks from '@/components/Blocks/Latest';
import Search, { redirect, SearchToast } from '@/components/common/Search';
import fetcher from '@/utils/fetcher';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Overview from '@/components/Transactions/Overview';
import LatestTransactions from '@/components/Transactions/Latest';
import { fetchData } from '@/utils/fetchData';
import { toast } from 'react-toastify';
import search from '@/utils/search';
import { useRouter } from 'next/router';
import { getCookieFromRequest } from '@/utils/libs';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  chartDetails: any;
  blockDetails: any;
  txnsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
  error: boolean;
}> = async (context) => {
  try {
    const [chartResult, blockResult, txnsResult] = await Promise.allSettled([
      fetcher(`charts/latest`),
      fetcher(`blocks/latest`),
      fetcher(`txns/latest`),
    ]);

    const chartDetails =
      chartResult.status === 'fulfilled' ? chartResult.value : null;
    const blockDetails =
      blockResult.status === 'fulfilled' ? blockResult.value : null;
    const txnsDetails =
      txnsResult.status === 'fulfilled' ? txnsResult.value : null;

    const { statsDetails, latestBlocks, error } = await fetchData();

    const { req } = context;
    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

    return {
      props: {
        statsDetails,
        chartDetails,
        blockDetails,
        txnsDetails,
        latestBlocks,
        signedAccountId,
        error,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        statsDetails: null,
        chartDetails: null,
        blockDetails: null,
        txnsDetails: null,
        latestBlocks: null,
        signedAccountId: null,
        error: true,
      },
    };
  }
};

const HomePage = ({
  statsDetails,
  chartDetails,
  blockDetails,
  txnsDetails,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { q } = router.query;
  const stats = statsDetails?.stats?.[0];
  const charts = chartDetails;
  const blocks = blockDetails?.blocks || [];
  const txns = txnsDetails?.txns || [];
  const thumbnail = `${ogUrl}/thumbnail/home?brand=near`;

  useEffect(() => {
    const loadResults = async (keyword: string) => {
      const route = await search(keyword, 'all', true);

      if (route) {
        return redirect(route);
      }

      return toast.error(SearchToast);
    };

    const keyword = typeof q === 'string' ? q.trim() : '';

    if (keyword) {
      loadResults(keyword);
    }
  }, [q]);

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('home:metaTitle')}`}
        </title>
        <meta name="title" content={t('home:metaTitle')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:title" content={t('home:metaTitle')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta property="twitter:title" content={t('home:metaTitle')} />
        <meta property="twitter:image" content={thumbnail} />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/`} />
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          href={
            network === 'testnet'
              ? '/opensearch_testnet.xml'
              : '/opensearch_mainnet.xml'
          }
          title="nearblocks"
        />
      </Head>
      <div>
        <div className="flex items-center justify-center bg-hero-pattern dark:bg-hero-pattern-dark">
          <div className="container mx-auto px-3 py-14 mb-10">
            <div className="flex flex-col lg:flex-row pb-5 lg:!items-center">
              <div className="relative lg:w-3/5 flex-col">
                <h1 className="text-white dark:text-neargray-10 text-2xl pb-3 flex flex-col">
                  {t('home:heroTitle')}
                </h1>
                <div className="h-12" suppressHydrationWarning={true}>
                  <Search />
                </div>
                <div className="text-white"></div>
                {/* <div className="text-white pt-3 min-h-[80px] md:min-h-[35px]">
                  <SponserdText />
                </div> */}
              </div>
              <div className="lg:!flex hidden w-2/5 justify-center">
                {/* <Banner type="right" /> */}
              </div>
            </div>
          </div>
        </div>
        <div className="relative -mt-14 ">
          <Overview stats={stats} chartsDetails={charts} error={error} />
        </div>
        <div className="py-8">
          {/* <div className="lg:!hidden block container mx-auto px-3">
            <Banner type="center" />
          </div> */}
        </div>
        <section>
          <div className="container mx-auto px-3  z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-full w-full">
                <div className=" bg-white soft-shadow dark:bg-black-600  rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b p-3 dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                    {t('home:latestBlocks')}
                  </h2>
                  <div className="relative">
                    <LatestBlocks blocks={blocks} error={error} />
                  </div>
                </div>
              </div>
              <div className="h-full  w-full">
                <div className=" bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                    {t('home:latestTxns')}
                  </h2>
                  <div className="relative">
                    <LatestTransactions txns={txns} error={error} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

HomePage.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);

export default HomePage;
