import Layout from '@/components/Layouts';
import { fetcher } from '@/hooks/useFetch';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import Chart from '@/components/Charts/Chart';
import { getCookieFromRequest } from '@/utils/libs';

export const getServerSideProps: GetServerSideProps<{
  data: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
}> = async (context) => {
  try {
    const [dataResult, statsResult, latestBlocksResult] =
      await Promise.allSettled([
        fetcher('charts'),
        fetcher(`stats`),
        fetcher(`blocks/latest?limit=1`),
      ]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const error = dataResult.status === 'rejected';
    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;
    const { req } = context;
    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

    return {
      props: {
        data,
        error,
        statsDetails,
        latestBlocks,
        signedAccountId,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        data: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
        signedAccountId: null,
      },
    };
  }
};

const ActiveAccountsChart = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();

  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
            {t('charts:addresses.heading')}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="container mx-auto px-3 -mt-36">
          <div className="relative">
            <Chart
              poweredBy={false}
              chartTypes={'active-account-daily'}
              chartsData={data}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
};

ActiveAccountsChart.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);

export default ActiveAccountsChart;
