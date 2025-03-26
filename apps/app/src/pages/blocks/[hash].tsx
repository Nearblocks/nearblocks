import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { appUrl } from '@/utils/config';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import { getCookieFromRequest, nanoToMilli } from '@/utils/libs';
import Details from '@/components/Blocks/Detail';
import { fetchData } from '@/utils/fetchData';
import useRpc from '@/hooks/useRpc';
import { BlocksInfo } from '@/utils/types';
import { useRpcStore } from '@/stores/rpc';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

export const getServerSideProps: GetServerSideProps<{
  hash: string;
  blockInfo: any;
  price: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  signedAccountId: any;
}> = async (context) => {
  const {
    query: { hash },
    req,
  }: any = context;

  try {
    const [blockInfoResult] = await Promise.allSettled([
      fetcher(`blocks/${hash}`),
    ]);

    const { statsDetails, latestBlocks } = await fetchData();

    const signedAccountId =
      getCookieFromRequest('signedAccountId', req) || null;

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
        signedAccountId,
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
        signedAccountId: null,
      },
    };
  }
};

interface BlockData {
  blocks: BlocksInfo[];
}
const Block = ({
  hash,
  blockInfo,
  price,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation();

  const { getBlockDetails } = useRpc();

  const [rpcData, setRpcData] = useState<BlockData | null>(null);
  const [rpcError, setRpcError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);

  useEffect(() => {
    const fetchBlockData = async () => {
      setIsLoading(true);
      if (!blockInfo || blockInfo?.blocks?.length === 0) {
        try {
          const res = await getBlockDetails(hash);
          if (res) {
            let limit = 0;
            let used = 0;
            limit = res?.chunks.reduce((acc, curr) => acc + curr.gas_limit, 0);
            used = res.chunks.reduce((acc, curr) => acc + curr.gas_used, 0);

            const rpcBlockData = {
              blocks: [
                {
                  block_height: res?.header?.height,
                  block_hash: res?.header?.hash,
                  block_timestamp: res?.header?.timestamp,
                  author_account_id: res?.author,
                  gas_price: res?.header?.gas_price,
                  prev_block_hash: res?.header?.prev_hash,
                  chunks_agg: {
                    shards: res?.header?.chunks_included,
                    gas_limit: limit,
                    gas_used: used,
                  },
                },
              ],
            };

            setRpcData(rpcBlockData as unknown as BlockData);
          } else {
            switchRpc();
          }
        } catch (err) {
          setRpcError(true);
          console.error('Error fetching block data:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchBlockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockInfo, error, hash, switchRpc]);

  const blockHeight = !blockInfo?.blocks[0]?.block_height
    ? Number(rpcData?.blocks[0]?.block_height)
    : Number(blockInfo?.blocks[0]?.block_height);

  const blockHash = !blockInfo?.blocks[0]?.block_hash
    ? rpcData?.blocks[0]?.block_hash
    : blockInfo?.blocks[0]?.block_hash;

  const block =
    !blockInfo || blockInfo?.blocks?.length === 0 ? rpcData : blockInfo;
  const thumbnail = `${ogUrl}/thumbnail/block?block_height=${blockHeight}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:block.metaTitle',
            {
              block: blockHash ?? '',
            },
          )}`}
        </title>
        <meta
          name="title"
          content={t('blocks:block.metaTitle', { block: blockHash ?? '' })}
        />
        <meta
          name="description"
          content={t('blocks:block.metaDescription', {
            block: blockHash ?? '',
          })}
        />
        <meta
          property="og:title"
          content={t('blocks:block.metaTitle', { block: blockHash ?? '' })}
        />
        <meta
          property="og:description"
          content={t('blocks:block.metaDescription', {
            block: blockHash ?? '',
          })}
        />
        <meta
          property="twitter:title"
          content={t('blocks:block.metaTitle', { block: blockHash ?? '' })}
        />
        <meta
          property="twitter:description"
          content={t('blocks:block.metaDescription', {
            block: blockHash ?? '',
          })}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/blocks/${blockHash}`} />
      </Head>
      <div className="relative container mx-auto px-3">
        <Details
          hash={hash}
          blockInfo={block}
          price={price}
          error={error && rpcError}
          isLoading={isLoading}
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
    signedAccountId={page?.props?.signedAccountId}
  >
    {page}
  </Layout>
);
export default Block;
