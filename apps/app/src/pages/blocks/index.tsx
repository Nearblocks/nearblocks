import { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import Layout from '@/components/Layouts';
import List from '@/components/Blocks/List';
import { fetcher } from '@/hooks/useFetch';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { env } from 'next-runtime-env';
import { appUrl } from '@/utils/config';
import { useRouter } from 'next/router';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  apiUrl: string;
}> = async (context) => {
  try {
    const {
      query: { cursor = '' },
    } = context;
    const apiUrl = 'blocks';
    const fetchUrl = cursor ? `blocks?cursor=${cursor}` : `${apiUrl}`;
    let data = null;
    let error = false;
    let dataCount = null;

    try {
      data = await fetcher(`${fetchUrl}`, {
        cache: 'no-store',
      });
    } catch (e) {
      console.error('Error fetching blocks');
      error = true;
    }

    try {
      dataCount = await fetcher('blocks/count', { cache: 'no-store' });
    } catch (e) {}

    return {
      props: {
        data,
        dataCount,
        error,
        apiUrl: apiUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        loading: false,
        countLoading: false,
        error: true,
        apiUrl: '',
      },
    };
  }
};

const Blocks = ({
  data,
  dataCount,
  error,
  apiUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [url, setUrl] = useState(router.query.cursor || '');

  useEffect(() => {
    if (url && url !== router.query.cursor) {
      router.push(url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    t('blocks:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:metaTitle',
          )} `}
        </title>
        <meta name="title" content={t('blocks:metaTitle')} />
        <meta name="description" content={t('blocks:metaDescription')} />
        <meta property="og:title" content={t('blocks:metaTitle')} />
        <meta property="og:description" content={t('blocks:metaDescription')} />
        <meta property="twitter:title" content={t('blocks:metaTitle')} />
        <meta property="og:image" content={thumbnail} />
        <meta name="twitter:image" content={thumbnail} />
        <meta
          property="twitter:description"
          content={t('blocks:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/blocks`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('blocks:heading') : 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <List
              data={data}
              totalCount={dataCount}
              apiUrl={apiUrl}
              setUrl={setUrl}
              error={error}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

Blocks.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Blocks;
