import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import QueryString from 'qs';
import List from '@/components/Tokens/FTList';
import { fetchData } from '@/utils/fetchData';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  messages: any;
}> = async (context) => {
  const {
    query: { keyword = '', query = '', filter = 'all', ...qs },
  }: {
    query: {
      query?: string;
      keyword?: string;
      filter?: string;
      order?: string;
    };
  } = context;

  const params = { ...qs, order: qs.order || 'desc' };

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  const fetchUrl = `fts?sort=onchain_market_cap&per_page=50&${QueryString.stringify(
    params,
  )}`;
  const countUrl = `fts/count?${QueryString.stringify(params)}`;

  try {
    const [dataResult, dataCountResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher(countUrl),
    ]);

    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const error =
      dataResult.status === 'rejected' || dataCountResult.status === 'rejected';

    const locale = context?.params?.locale;
    const [commonMessages, tokenMessages, txnsMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/token.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/txns.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...tokenMessages.default,
      ...txnsMessages.default,
    };

    return {
      props: {
        data,
        dataCount,
        error,
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
        messages,
      },
    };
  } catch (error) {
    console.error('Error fetching FT tokens:', error);

    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
        searchResultDetails: null,
        searchRedirectDetails: null,
        messages: null,
      },
    };
  }
};

const TopFTTokens = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20NEP-141%20Tokens&brand=near`;
  return (
    <>
      <Head>
        <title>
          {`${
            network === 'testnet' ? 'TESTNET' : ''
          } Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks`}
        </title>
        <meta
          name="title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          name="description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta
          property="og:title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          property="og:description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta
          property="twitter:title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          property="twitter:description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/tokens`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              Near Protocol Ecosystem Tokens (NEP-141)
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

TopFTTokens.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);

export default TopFTTokens;
