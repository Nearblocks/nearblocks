import Head from 'next/head';
import { Fragment, ReactElement } from 'react';
import Layout from '@/components/Layouts';
import useTranslation from 'next-translate/useTranslation';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';
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

const AboutPage = () => {
  const { t } = useTranslation();
  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('about:heading'),
  )}&brand=near`;

  return (
    <Fragment>
      <Head>
        <title>{t('About NearBlocks | Nearblocks')}</title>
        <meta name="title" content={t('About Nearblocks')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:title" content={t('About Nearblocks')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta property="twitter:title" content={t('About Nearblocks')} />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
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
  >
    {page}
  </Layout>
);

export default AboutPage;
