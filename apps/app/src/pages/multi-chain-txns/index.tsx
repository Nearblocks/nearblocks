import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import { appUrl, chain } from '@/utils/config';
import { env } from 'next-runtime-env';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import Layout from '@/components/Layouts';
import { fetchData } from '@/utils/fetchData';
import Stats from '@/components/ChainAbstraction/Stats';
import MultiChainTxns from '@/components/ChainAbstraction/MultiChainTxns';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  apiUrl: string;
  statsDetails: any;
  latestBlocks: any;
  dataTxnsTotalCount: any;
  dataTxns24HrCount: any;
  dataChart: any;
}> = async (context) => {
  const {
    query: { ...qs },
  }: any = context;

  const apiUrl = `chain-abstraction/txns`;
  const fetchUrl = `${apiUrl}?${queryString.stringify(qs)}`;
  const countUrl = `${apiUrl}/count?${queryString.stringify(qs)}`;

  const today = new Date();
  const beforeDate = today.toISOString().split('T')[0];
  const afterDate = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const txnsTotalCountUrl = `${apiUrl}/count`;
  const txns24HrCountUrl = `${apiUrl}/count?after_date=${afterDate}&before_date=${beforeDate}`;
  const chartUrl = `charts`;

  try {
    const [
      dataResult,
      dataCountResult,
      txnsTotalCountResult,
      txns24HrCountResult,
      chartResult,
    ] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher(countUrl),
      fetcher(txnsTotalCountUrl),
      fetcher(txns24HrCountUrl),
      fetcher(chartUrl),
    ]);

    const { statsDetails, latestBlocks } = await fetchData();

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const dataTxnsTotalCount =
      txnsTotalCountResult.status === 'fulfilled'
        ? txnsTotalCountResult.value
        : null;
    const dataTxns24HrCount =
      txns24HrCountResult.status === 'fulfilled'
        ? txns24HrCountResult.value
        : null;
    const dataChart =
      chartResult.status === 'fulfilled' ? chartResult.value : null;

    const error = dataResult.status === 'rejected';

    return {
      props: {
        data,
        dataCount,
        error,
        apiUrl,
        statsDetails,
        latestBlocks,
        dataTxnsTotalCount,
        dataTxns24HrCount,
        dataChart,
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
        dataTxnsTotalCount: null,
        dataTxns24HrCount: null,
        dataChart: null,
      },
    };
  }
};

const TransactionList = ({
  data,
  dataCount,
  dataTxnsTotalCount,
  dataTxns24HrCount,
  dataChart,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();

  const count = dataCount?.txns[0]?.count;
  const txns = data?.txns;
  let cursor = data?.cursor;

  const txnsTotalCount = dataTxnsTotalCount?.txns[0]?.count;
  const txns24HrCount = dataTxns24HrCount?.txns[0]?.count;

  const networksCount = Object.keys(chain).length;

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('multi-chain-txns:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'multi-chain-txns:metaTitle',
          )} | NearBlocks`}
        </title>
        <meta
          name="title"
          content={`${t('multi-chain-txns:metaTitle')} | NearBlocks`}
        />
        <meta
          name="description"
          content={t('multi-chain-txns:metaDescription')}
        />
        <meta
          property="og:title"
          content={`${t('multi-chain-txns:metaTitle')} | NearBlocks`}
        />
        <meta
          property="og:description"
          content={t('multi-chain-txns:metaDescription')}
        />
        <meta
          property="twitter:title"
          content={`${t('multi-chain-txns:metaTitle')} | NearBlocks`}
        />
        <meta
          property="twitter:description"
          content={t('multi-chain-txns:metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/multi-chain-txns`} />
      </Head>
      <div className=" h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-gray-700 dark:text-neargray-10 ">
            {t
              ? t('multi-chain-txns:heading')
              : 'Latest Multichain Transactions'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <Stats
              txnsTotalCount={txnsTotalCount}
              txns24HrCount={txns24HrCount}
              networksCount={networksCount}
              dataChart={dataChart}
              error={error}
            />
            <div className="py-6"></div>
            <MultiChainTxns
              txns={txns}
              count={count}
              error={error}
              isTab={false}
              tab={''}
              cursor={cursor}
            />
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
  >
    {page}
  </Layout>
);
export default TransactionList;
