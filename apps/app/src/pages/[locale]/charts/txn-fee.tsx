import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { ReactElement } from 'react';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import fetcher from '@/utils/fetcher';
import Chart from '@/components/Charts/Chart';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
  messages: any;
}> = async (context: any) => {
  const { params } = context;
  const {
    query: { keyword = '', query = '', filter = 'all' },
  }: any = context;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  try {
    const [dataResult] = await Promise.allSettled([fetcher('charts')]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const error = dataResult.status === 'rejected';
    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const locale = params?.locale;
    const [commonMessages, chartMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/charts.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...chartMessages.default,
    };

    return {
      props: {
        data,
        error,
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
        messages,
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
        searchResultDetails: null,
        searchRedirectDetails: null,
        messages: null,
      },
    };
  }
};

const TxnFeeChart = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const t = useTranslations();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('txnFee.heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>{t('txnFee.metaTitle')}</title>
        <meta name="title" content={t('txnFee.metaTitle')} />
        <meta name="description" content={t('txnFee.metaDescription')} />
        <meta property="og:title" content={t('txnFee.metaTitle')} />
        <meta property="og:description" content={t('txnFee.metaDescription')} />
        <meta property="twitter:title" content={t('txnFee.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('txnFee.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/charts/txn-fee`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
              {t('txnFee.heading')}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48">
          <div className="container mx-auto px-3 -mt-36">
            <div className="relative">
              <Chart
                poweredBy={false}
                chartTypes={'txn-fee'}
                chartsData={data}
              />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};

TxnFeeChart.getLayout = (page: ReactElement) => (
  <Layout
    notice={<Notice />}
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);

export default TxnFeeChart;
