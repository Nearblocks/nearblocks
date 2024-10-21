import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import React, { ReactElement } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { env } from 'next-runtime-env';
import Banner from '@/components/Banner';
import SponserdText from '@/components/SponserdText';
import LatestBlocks from '@/components/Blocks/Latest';
import Search from '@/components/common/Search';
import fetcher from '@/utils/fetcher';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Overview from '@/components/Transactions/Overview';
import LatestTransactions from '@/components/Transactions/Latest';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  chartDetails: any;
  blockDetails: any;
  txnsDetails: any;
  latestBlocks: any;
  searchRedirectDetails: any;
  searchResultDetails: any;
  error: boolean;
  messages: any;
}> = async (context) => {
  const {
    query: { query = '', keyword = '', filter = 'all' },
  }: {
    query: { query?: string; keyword?: string; filter?: string };
    req: any;
  } = context;

  const q = query?.replace(/[\s,]/g, '');
  const key = keyword?.replace(/[\s,]/g, '');

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

    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
      error,
    } = await fetchData(q, key, filter);

    const locale = context?.params?.locale;
    const [homeMessages, commoneMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/home.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
    ]);

    // Combine all messages into a single object
    const messages = {
      ...homeMessages.default,
      ...commoneMessages.default,
    };

    return {
      props: {
        statsDetails,
        chartDetails,
        blockDetails,
        txnsDetails,
        latestBlocks,
        searchRedirectDetails,
        searchResultDetails,
        error,
        messages,
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
        searchRedirectDetails: null,
        searchResultDetails: null,
        error: true,
        messages: null,
      },
    };
  }
};

const HomePage = ({
  statsDetails,
  chartDetails,
  blockDetails,
  txnsDetails,
  searchRedirectDetails,
  searchResultDetails,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const t = useTranslations();
  const stats = statsDetails?.stats?.[0] || [];
  const charts = chartDetails;
  const blocks = blockDetails?.blocks || [];
  const txns = txnsDetails?.txns || [];
  const thumbnail = `${ogUrl}/thumbnail/home?brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('metaTitle')}`}
        </title>
        <meta name="title" content={t('metaTitle')} />
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:title" content={t('metaTitle')} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="twitter:title" content={t('metaTitle')} />
        <meta property="twitter:image" content={thumbnail} />
        <meta property="twitter:description" content={t('metaDescription')} />
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
                  {t('heroTitle')}
                </h1>
                <div className="h-12" suppressHydrationWarning={true}>
                  <Search
                    result={searchResultDetails}
                    redirectResult={searchRedirectDetails}
                  />
                </div>
                <div className="text-white"></div>
                <div className="text-white pt-3 min-h-[80px] md:min-h-[35px]">
                  <SponserdText />
                </div>
              </div>
              <div className="lg:!flex hidden w-2/5 justify-center">
                <Banner type="right" />
              </div>
            </div>
          </div>
        </div>
        <div className="relative -mt-14 ">
          <Overview stats={stats} chartsDetails={charts} error={error} />
        </div>
        <div className="py-8">
          <div className="lg:!hidden block container mx-auto px-3">
            <Banner type="center" />
          </div>
        </div>
        <section>
          <div className="container mx-auto px-3  z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-full w-full">
                <div className=" bg-white soft-shadow dark:bg-black-600  rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b p-3 dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                    {t('latestBlocks')}
                  </h2>
                  <div className="relative">
                    <LatestBlocks blocks={blocks} error={error} />
                  </div>
                </div>
              </div>
              <div className="h-full  w-full">
                <div className=" bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                    {t('latestTxns')}
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
  >
    {page}
  </Layout>
);

export default HomePage;
