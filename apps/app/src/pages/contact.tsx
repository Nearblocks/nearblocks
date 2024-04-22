/* eslint-disable @next/next/no-img-element */
import Head from 'next/head';
import { Fragment, ReactElement } from 'react';
import Layout from '@/components/Layouts';
import useTranslation from 'next-translate/useTranslation';
import FormContact from '@/components/Layouts/FormContact';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const Contract = () => {
  const { t } = useTranslation();
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Contact&brand=near`;

  return (
    <Fragment>
      <Head>
        <title>{t('Contact Nearblocks')}</title>
        <meta name="title" content={t('Contact Nearblocks')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:title" content={t('Contact Nearblocks')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta property="twitter:title" content={t('Contact Nearblocks')} />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/contact`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72"></div>
      <div className="container mx-auto px-3 md:px-14 flex flex-col items-start md:py-16 mt-[-300px]">
        <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
          {t('Contact Nearblocks')}
        </h1>
        <div className="text-neargray-600 dark:text-neargray-10 sm:grid sm:grid-cols-11 pt-12 pb-8 gap-6 pl-8 pr-14 w-full soft-shadow sm:divide-x rounded-lg bg-white dark:bg-black-600 lg:mt-8 mt-4">
          <div className="col-span-5">
            <p className="text-lg text-black font-medium dark:text-neargray-10">
              {t(`Drop us a message, but please be aware that:`)}
            </p>
            <div className="mt-10 flex flex-col gap-8">
              {[
                {
                  id: Math.random(),
                  title: 'Pending Transaction',
                  description: `We do not process transactions and are therefore unable to expedite, cancel or replace them.                  .`,
                },
                {
                  id: Math.random(),
                  title: 'Near Protocol Block Explorer',
                  description: `NearBlocks is an independent block explorer unrelated to other service providers (unless stated explicitly otherwise) and is therefore unable to provide a precise response for inquiries that are specific to other service providers.`,
                },
                {
                  id: Math.random(),
                  title: 'Wallet / Exchange / Project related issues ',
                  description: `Kindly reach out to your wallet service provider, exchanges or project/contract owner for further support as they are in a better position to assist you on the issues related to and from their platforms.`,
                },
              ].map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-base">{t(item.title)}</p>
                  <p className="text-sm mt-3">{t(item.description)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-6 pl-10">
            <FormContact />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

Contract.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Contract;
