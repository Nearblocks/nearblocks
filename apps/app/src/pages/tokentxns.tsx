import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import Transfers from '@/components/Tokens/FTTransfers';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';
const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  syncDetails: any;
  error: boolean;
  apiUrl: string;
}> = async ({ query }) => {
  const apiUrl = 'fts/txns';
  const fetchUrl = `${apiUrl}?${queryString.stringify(query)}`;

  try {
    const [dataResult, dataCountResult, syncResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('fts/txns/count'),
      fetcher('sync/status'),
    ]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const syncDetails =
      syncResult.status === 'fulfilled' ? syncResult.value : null;
    const error =
      dataResult.status === 'rejected' || dataCountResult.status === 'rejected';

    return {
      props: {
        data,
        dataCount,
        syncDetails,
        error,
        apiUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);

    return {
      props: {
        data: null,
        dataCount: null,
        syncDetails: null,
        error: true,
        apiUrl: '',
      },
    };
  }
};

const ToxenTxns = ({
  data,
  dataCount,
  syncDetails,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const status = syncDetails?.status?.indexers?.events || {
    height: 0,
    sync: true,
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleRouteChangeStart = (url: string) => {
      if (url !== router.asPath) {
        timeout = setTimeout(() => {
          setLoading(true);
        }, 300);
      }
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

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
        {loading && <Spinner />}
        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <Transfers
                data={data}
                totalCount={dataCount}
                error={error}
                status={status}
              />
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
