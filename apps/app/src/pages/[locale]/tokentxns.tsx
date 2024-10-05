import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import Transfers from '@/components/Tokens/FTTransfers';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  syncDetails: any;
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
    };
  } = context;
  const apiUrl = 'fts/txns';
  const fetchUrl = `${apiUrl}?${queryString.stringify(qs)}`;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  try {
    const [dataResult, dataCountResult, syncResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('fts/txns/count'),
      fetcher('sync/status'),
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
    const syncDetails =
      syncResult.status === 'fulfilled' ? syncResult.value : null;
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
        syncDetails,
        error,
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
        syncDetails: null,
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

const ToxenTxns = ({
  data,
  dataCount,
  syncDetails,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const t = useTranslations();
  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };

  const thumbnail = `${ogUrl}/thumbnail/basic?title=Latest%20Near%20NEP-141%20Token%20Transfers&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('fts.metaTitle')} `}
        </title>
        <meta name="title" content={t('fts.metaTitle')} />
        <meta name="description" content={t('fts.metaDescription')} />
        <meta property="og:title" content={t('fts.metaTitle')} />
        <meta property="og:description" content={t('fts.metaDescription')} />
        <meta property="twitter:title" content={t('fts.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('fts.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/tokentxns`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              {t ? t('fts.heading') : 'Token Transfers'}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <Transfers
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
ToxenTxns.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);

export default ToxenTxns;
