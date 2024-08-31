import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement } from 'react';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import fetcher from '@/utils/fetcher';
import Chart from '@/components/Charts/Chart';

const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
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

    return {
      props: {
        data,
        error,
        statsDetails,
        latestBlocks,
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
      },
    };
  }
};

const NearPriceChart = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('charts:nearPrice.heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>{t('charts:nearPrice.metaTitle')}</title>
        <meta name="title" content={t('charts:nearPrice.metaTitle')} />
        <meta
          name="description"
          content={t('charts:nearPrice.metaDescription')}
        />
        <meta property="og:title" content={t('charts:nearPrice.metaTitle')} />
        <meta
          property="og:description"
          content={t('charts:nearPrice.metaDescription')}
        />
        <meta
          property="twitter:title"
          content={t('charts:nearPrice.metaTitle')}
        />
        <meta
          property="twitter:description"
          content={t('charts:nearPrice.metaDescription')}
        />

        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/charts/near-price`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
              {t('charts:nearPrice.heading')}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48">
          <div className="container mx-auto px-3 -mt-36">
            <div className="relative">
              <Chart
                poweredBy={false}
                chartTypes={'near-price'}
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

NearPriceChart.getLayout = (page: ReactElement) => (
  <Layout
    notice={<Notice />}
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default NearPriceChart;
