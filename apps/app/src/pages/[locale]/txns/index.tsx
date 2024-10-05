import Head from 'next/head';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import List from '@/components/Transactions/List';
import Layout from '@/components/Layouts';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  apiUrl: string;
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
  messages: any;
}> = async (context) => {
  const {
    query: { keyword = '', query = '', filter = 'all', ...qs },
  }: {
    query: {
      query?: string;
      keyword?: string;
      filter?: string;
    };
  } = context;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  const apiUrl = `txns`;
  const fetchUrl = `${apiUrl}?${queryString.stringify(qs)}`;
  const countUrl = `txns/count?${queryString.stringify(qs)}`;

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
    const error = dataResult.status === 'rejected';

    const locale = context?.params?.locale;
    const [commonMessages, txnsMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/txns.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...txnsMessages.default,
    };
    return {
      props: {
        data,
        dataCount,
        error,
        apiUrl,
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
        messages,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        apiUrl: '',
        statsDetails: null,
        latestBlocks: null,
        searchResultDetails: null,
        searchRedirectDetails: null,
        messages: null,
      },
    };
  }
};

const TransactionList = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const t = useTranslations();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('metaTitle')} `}
        </title>
        <meta name="title" content={t('metaTitle')} />
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={t('metaTitle')} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="twitter:title" content={t('metaTitle')} />
        <meta property="twitter:description" content={t('metaDescription')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/txns`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('heading') : 'Latest Near Protocol transactions'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <List txnsData={data} txnsCount={dataCount} error={error} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};
TransactionList.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);
export default TransactionList;
