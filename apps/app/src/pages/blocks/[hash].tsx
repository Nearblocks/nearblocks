import { useRouter } from 'next/router';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { appUrl } from '@/utils/config';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { Spinner } from '@/components/common/Spinner';
import fetcher from '@/utils/fetcher';
import { nanoToMilli } from '@/utils/libs';
import Details from '@/components/Blocks/Detail';
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

export const getServerSideProps: GetServerSideProps<{
  hash: string;
  blockInfo: any;
  price: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
}> = async (context) => {
  const {
    query: { hash },
  }: any = context;

  try {
    const [blockInfoResult, statsResult, latestBlocksResult] =
      await Promise.allSettled([
        fetcher(`blocks/${hash}`),
        fetcher(`stats`),
        fetcher(`blocks/latest?limit=1`),
      ]);

    const blockInfo =
      blockInfoResult.status === 'fulfilled' ? blockInfoResult.value : null;
    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    const error = blockInfoResult.status === 'rejected';

    let price: number | null = null;

    let blockTimeStamp = blockInfo?.blocks?.[0]?.block_timestamp;

    if (blockTimeStamp) {
      const timestamp = new Date(nanoToMilli(blockTimeStamp));
      const currentDate = new Date();
      const currentDt = currentDate.toISOString().split('T')[0];
      const blockDt = timestamp.toISOString().split('T')[0];
      if (currentDt > blockDt) {
        const priceData = await fetcher(`stats/price?date=${blockDt}`);
        price = priceData?.stats?.[0]?.near_price || null;
      }
    }

    return {
      props: {
        hash,
        blockInfo,
        price,
        error,
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return {
      props: {
        hash: null,
        blockInfo: null,
        price: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const Block = ({
  hash,
  blockInfo,
  price,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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

  const blockHeight = Number(blockInfo?.blocks[0]?.block_height);
  const thumbnail = `${ogUrl}/thumbnail/block?block_height=${blockHeight}&brand=near`;
  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:block.metaTitle',
            {
              block: hash,
            },
          )}`}
        </title>
        <meta
          name="title"
          content={t('blocks:block.metaTitle', { block: hash })}
        />
        <meta
          name="description"
          content={t('blocks:block.metaDescription', { block: hash })}
        />
        <meta
          property="og:title"
          content={t('blocks:block.metaTitle', { block: hash })}
        />
        <meta
          property="og:description"
          content={t('blocks:block.metaDescription', { block: hash })}
        />
        <meta
          property="twitter:title"
          content={t('blocks:block.metaTitle', { block: hash })}
        />
        <meta
          property="twitter:description"
          content={t('blocks:block.metaDescription', { block: hash })}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/blocks/${hash}`} />
      </Head>
      {loading && <Spinner />}
      <div className="relative container mx-auto px-3">
        <Details
          hash={hash}
          blockInfo={blockInfo}
          price={price}
          error={error}
        />
      </div>
      <div className="py-8"></div>
    </>
  );
};
Block.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);
export default Block;
