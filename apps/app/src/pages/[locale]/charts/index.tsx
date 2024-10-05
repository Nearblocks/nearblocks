import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { ReactElement } from 'react';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';
import Chart from '@/components/Charts/Chart';
import { GetServerSideProps } from 'next';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
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
    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const locale = params?.locale;
    const [commonMessages, blockMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/charts.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...blockMessages.default,
    };

    return {
      props: {
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
        statsDetails: null,
        latestBlocks: null,
        searchResultDetails: null,
        searchRedirectDetails: null,
        messages: null,
      },
    };
  }
};

const Charts = () => {
  const t = useTranslations();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>{t('metaTitle')}</title>
        <meta name="title" content={t('metaTitle')} />
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={t('metaTitle')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="twitter:title" content={t('metaTitle')} />
        <meta property="twitter:image" content={thumbnail} />
        <meta property="twitter:description" content={t('metaDescription')} />
        <link rel="canonical" href={`${appUrl}/charts`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t('heading')}
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
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);
export default Charts;
