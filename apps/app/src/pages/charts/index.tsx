import Head from 'next/head';
import Layout from '@/components/Layouts';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useState } from 'react';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';
import Chart from '@/components/Charts/Chart';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const Charts = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        {loading && <Spinner />}
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
  <Layout notice={<Notice />}>{page}</Layout>
);

export default Charts;
