import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement } from 'react';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';
import Chart from '@/components/Charts/Chart';
import { GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';

const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
  try {
    const [statsResult, latestBlocksResult] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    return {
      props: {
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const Charts = () => {
  const { t } = useTranslation();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('charts:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>{t('charts:metaTitle')}</title>
        <meta name="title" content={t('charts:metaTitle')} />
        <meta name="description" content={t('charts:metaDescription')} />
        <meta property="og:title" content={t('charts:metaTitle')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:description" content={t('charts:metaDescription')} />
        <meta property="twitter:title" content={t('charts:metaTitle')} />
        <meta property="twitter:image" content={thumbnail} />
        <meta
          property="twitter:description"
          content={t('charts:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/charts`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t('charts:heading')}
          </h1>
        </div>
      </div>
      <div className="mx-auto px-3 -mt-48">
        <div className="container mx-auto px-3 -mt-36">
          <div className="relative">
            <Chart poweredBy={false} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

Charts.getLayout = (page: ReactElement) => (
  <Layout
    notice={<Notice />}
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);
export default Charts;
