import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';
import { fetcher } from '@/hooks/useFetch';
import useQSFilters from '@/hooks/useQSFilters';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Layout = dynamic(() => import('@/components/Layouts'));
const List = dynamic(() => import('@/components/Transaction/List'));

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  apiUrl: string;
}> = async (context) => {
  const { query } = context;
  const queryParams = new URLSearchParams();

  ['cursor', 'method', 'action', 'from', 'to', 'order', 'block'].forEach(
    (key) => {
      if (query[key]) {
        queryParams.append(key, query[key] as string);
      }
    },
  );

  const apiUrl = `txns`;
  const fetchUrl = `${apiUrl}?${queryParams.toString()}`;
  const countUrl = `txns/count?${queryParams.toString()}`;

  try {
    const [data, dataCount] = await Promise.all([
      fetcher(fetchUrl, { cache: 'no-store' }),
      fetcher(countUrl, { cache: 'no-store' }),
    ]);

    return {
      props: {
        data,
        dataCount,
        error: false,
        apiUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        error: true,
        apiUrl: '',
      },
    };
  }
};

const TransactionList = ({
  data,
  dataCount,
  error,
  apiUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { qs, filters, setFilters } = useQSFilters();
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (qs && qs !== router.asPath) {
      const newUrl = new URL(window.location.href);
      Object.entries(router.query).forEach(([key, value]) => {
        if (value) {
          newUrl.searchParams.set(key, value.toString());
        }
      });
      router.push(newUrl.toString());
    }
  }, [qs]);

  useEffect(() => {
    if (url && url !== router.asPath) {
      router.push(url);
    }
  }, [url]);

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
        <link rel="canonical" href={`${appUrl}/txns`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('txns:heading') : 'Latest Near Protocol transactions'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <List
              txnsData={data}
              txnsCount={dataCount}
              apiUrl={apiUrl}
              setUrl={setUrl}
              error={error}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};
TransactionList.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default TransactionList;
