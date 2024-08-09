import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import Transfers from '@/components/Token/FT/Transfers';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const ToxenTxns = () => {
  const { t } = useTranslation();
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Latest%20Near%20NEP-141%20Token%20Transfers&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'token:fts.metaTitle',
          )} `}
        </title>
        <meta name="title" content={t('token:fts.metaTitle')} />
        <meta name="description" content={t('token:fts.metaDescription')} />
        <meta property="og:title" content={t('token:fts.metaTitle')} />
        <meta
          property="og:description"
          content={t('token:fts.metaDescription')}
        />
        <meta property="twitter:title" content={t('token:fts.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('token:fts.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/tokentxns`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              {t ? t('token:fts.heading') : 'Token Transfers'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full">
              <Transfers />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};
ToxenTxns.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default ToxenTxns;
