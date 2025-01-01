import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import Transfers from '@/components/Tokens/FTTransfers';
import { fetchData } from '@/utils/fetchData';
import { getCookieFromRequest } from '@/utils/libs';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  syncDetails: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
}> = async (context) => {
  const {
    query: { ...qs },
    req,
  }: any = context;
  const apiUrl = 'fts/txns';
  const fetchUrl = `${apiUrl}?${queryString.stringify(qs)}`;

  try {
    const [dataResult, dataCountResult, syncResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('fts/txns/count'),
      fetcher('sync/status'),
    ]);

    const { statsDetails, latestBlocks } = await fetchData();

    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const syncDetails =
      syncResult.status === 'fulfilled' ? syncResult.value : null;
    const error =
      dataResult.status === 'rejected' || dataCountResult.status === 'rejected';

    return {
      props: {
        data,
        dataCount,
        syncDetails,
        error,
        statsDetails,
        latestBlocks,
        signedAccountId,
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
        signedAccountId: null,
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
  const { t } = useTranslation();
  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };

  const thumbnail = `${ogUrl}/thumbnail/basic?title=Latest%20Near%20NEP-141%20Token%20Transfers&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'token:fts.metaTitle',
          )} `}
        </title>
        <meta name="title" content={t('token:fts.metaTitle')} />
        <meta name="description" content={t('token:fts.metaDescription')} />
        <meta property="og:title" content={t('token:fts.metaTitle')} />
        <meta
          property="og:description"
          content={t('token:fts.metaDescription')}
        />
        <meta property="twitter:title" content={t('token:fts.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('token:fts.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/tokentxns`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              {t ? t('token:fts.heading') : 'Token Transfers'}
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
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);

export default ToxenTxns;
