import Head from 'next/head';
import { Fragment, ReactElement } from 'react';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';
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

    const locale = context?.params?.locale;
    const [commonMessages, aboutMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/about.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...aboutMessages.default,
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

const AboutPage = () => {
  const t = useTranslations();
  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('about:heading'),
  )}&brand=near`;

  return (
    <Fragment>
      <Head>
        <title>{t('About NearBlocks | Nearblocks')}</title>
        <meta name="title" content={t('About Nearblocks')} />
        <meta name="description" content={t('metaDescription')} />
        <meta property="og:title" content={t('About Nearblocks')} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="twitter:title" content={t('About Nearblocks')} />
        <meta property="twitter:description" content={t('metaDescription')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/about`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72 -mb-48"></div>
      <div className="py-16 bg-white dark:bg-black-600 soft-shadow sm:container sm:mx-auto rounded-md my-10">
        <h1 className="mb-4 pt-8 sm:text-2xl text-center text-2xl text-green-500 dark:text-green-250">
          {t('About Nearblocks')}
        </h1>
        <div className="text-base text-neargray-600 dark:text-neargray-10 py-8  mx-10 text-center">
          {t(
            'NearBlocks is the leading Blockchain Explorer, Search, API and Analytics Platform for Near Protocol, a decentralized smart contracts platform. Built and launched in 2022, it is one of the earliest projects built around Near Protocol and its community with the mission of providing equitable access to blockchain data.',
          )}
        </div>
      </div>
    </Fragment>
  );
};

AboutPage.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);

export default AboutPage;
