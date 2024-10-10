import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { appUrl } from '@/utils/config';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import { nanoToMilli } from '@/utils/libs';
import Details from '@/components/Blocks/Detail';
import { fetchData } from '@/utils/fetchData';
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

export const getServerSideProps: GetServerSideProps<{
  hash: string;
  blockInfo: any;
  price: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
}> = async (context) => {
  const {
    query: { hash, keyword = '', query = '', filter = 'all' },
  }: any = context;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  try {
    const [blockInfoResult] = await Promise.allSettled([
      fetcher(`blocks/${hash}`),
    ]);

    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const blockInfo =
      blockInfoResult.status === 'fulfilled' ? blockInfoResult.value : null;

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
        searchResultDetails,
        searchRedirectDetails,
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
        searchResultDetails: null,
        searchRedirectDetails: null,
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
  const blockHeight = Number(blockInfo?.blocks[0]?.block_height);
  const blockHash = blockInfo?.blocks[0]?.block_hash;

  const thumbnail = `${ogUrl}/thumbnail/block?block_height=${blockHeight}&brand=near`;
  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:block.metaTitle',
            {
              block: blockHash,
            },
          )}`}
        </title>
        <meta
          name="title"
          content={t('blocks:block.metaTitle', { block: blockHash })}
        />
        <meta
          name="description"
          content={t('blocks:block.metaDescription', { block: blockHash })}
        />
        <meta
          property="og:title"
          content={t('blocks:block.metaTitle', { block: blockHash })}
        />
        <meta
          property="og:description"
          content={t('blocks:block.metaDescription', { block: blockHash })}
        />
        <meta
          property="twitter:title"
          content={t('blocks:block.metaTitle', { block: blockHash })}
        />
        <meta
          property="twitter:description"
          content={t('blocks:block.metaDescription', { block: blockHash })}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/blocks/${blockHash}`} />
      </Head>
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
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);
export default Block;
