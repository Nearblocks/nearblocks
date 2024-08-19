import { env } from 'next-runtime-env';
import React, { ReactElement } from 'react';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { appUrl } from '@/utils/config';
import Layout from '@/components/Layouts';
import VerifyContractForm from '@/components/Contract/Form';
import SponserdText from '@/components/SponserdText';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const VerifyContract = () => {
  const { t } = useTranslation();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('txns:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('txns:metaTitle')} `}
        </title>
        <meta name="title" content={t('txns:metaTitle')} />
        <meta name="description" content={t('txns:metaDescription')} />
        <meta property="og:title" content={t('txns:metaTitle')} />
        <meta property="og:description" content={t('txns:metaDescription')} />
        <meta property="twitter:title" content={t('txns:metaTitle')} />
        <meta
          property="twitter:description"
          content={t('txns:metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/verifyContract`} />
      </Head>
      <div className="h-72"></div>
      <div className="container mx-auto px-3 md:px-14 flex flex-col items-center mt-[-300px]">
        <div className="md:flex items-center justify-center container mx-auto px-3">
          <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 pt-5 pb-2 w-full text-center">
            {t ? t('verify.verifyContract') : 'Verify Contract'}
          </h1>
        </div>
        <div className="container mx-auto pt-3 pb-6 px-5 text-nearblue-600">
          <SponserdText />
        </div>
        <div className="w-full max-w-3xl flex flex-col items-center mt-8 space-y-6">
          <VerifyContractForm />
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

VerifyContract.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default VerifyContract;
