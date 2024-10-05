import { ReactElement } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layouts';
import List from '@/components/Blocks/List';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { env } from 'next-runtime-env';
import { appUrl } from '@/utils/config';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
}> = async (context) => {
  const {
    query: { keyword = '', filter = 'all', query = '', ...qs },
  }: any = context;

  const apiUrl = 'blocks';
  const fetchUrl = qs ? `blocks?${queryString.stringify(qs)}` : `${apiUrl}`;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  try {
    const [dataResult, dataCountResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('blocks/count'),
    ]);
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const error = dataResult.status === 'rejected';

    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const locale = context?.params?.locale;
    const [commonMessages, blockMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/blocks.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...blockMessages.default,
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
    console.error('Error fetching blocks:', error);
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

const Blocks = ({
  data,
  dataCount,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const t = useTranslations();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
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
        <meta property="og:image" content={thumbnail} />
        <meta name="twitter:image" content={thumbnail} />
        <meta property="twitter:description" content={t('metaDescription')} />
        <link rel="canonical" href={`${appUrl}/blocks`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('heading') : 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <List data={data} totalCount={dataCount} error={error} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

Blocks.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);

export default Blocks;
