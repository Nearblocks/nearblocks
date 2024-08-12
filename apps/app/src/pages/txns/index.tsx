import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import { appUrl } from '@/utils/config';
import { env } from 'next-runtime-env';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import List from '@/components/Transactions/List';
import Layout from '@/components/Layouts';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  error: boolean;
  apiUrl: string;
}> = async (context) => {
  const { query } = context;

  const apiUrl = `txns`;
  const fetchUrl = `${apiUrl}?${queryString.stringify(query)}`;
  const countUrl = `txns/count?${queryString.stringify(query)}`;

  try {
    const [dataResult, dataCountResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher(countUrl),
    ]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const error = dataResult.status === 'rejected';

    return {
      props: {
        data,
        dataCount,
        error,
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
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
            <List txnsData={data} txnsCount={dataCount} error={error} />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};
TransactionList.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default TransactionList;
