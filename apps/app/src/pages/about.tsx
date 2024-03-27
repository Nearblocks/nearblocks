import Head from 'next/head';
import { Fragment, ReactElement } from 'react';
import Layout from '@/components/Layouts';
import useTranslation from 'next-translate/useTranslation';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Head>
        <title>{t('About Nearblocks')}</title>
        <meta name="title" content={t('About Nearblocks')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:title" content={t('About Nearblocks')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta property="twitter:title" content={t('About Nearblocks')} />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
        <meta property="og:image" content="/thumbnail/thumbnail_about.png" />
        <meta
          property="twitter:image"
          content="/thumbnail/thumbnail_about.png"
        />
      </Head>
      <div className="bg-hero-pattern h-72 -mb-48"></div>
      <div className="py-16 bg-white soft-shadow sm:container sm:mx-auto rounded-md my-10">
        <h1 className="mb-4 pt-8 sm:text-2xl text-center text-2xl text-green-500">
          {t('About Nearblocks')}
        </h1>
        <div className="text-base text-neargray-600 py-8  mx-10 text-center">
          {t(
            'NearBlocks is the leading Blockchain Explorer, Search, API and Analytics Platform for Near Protocol, a decentralized smart contracts platform. Built and launched in 2022, it is one of the earliest projects built around Near Protocol and its community with the mission of providing equitable access to blockchain data.',
          )}
        </div>
      </div>
    </Fragment>
  );
};

AboutPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default AboutPage;
