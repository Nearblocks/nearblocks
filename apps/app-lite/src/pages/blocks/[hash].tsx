import Big from 'big.js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { RPC, RpcResultBlock } from 'nb-near';

import Copy from '@/components/Common/Copy';
import Error from '@/components/Common/Error';
import Tooltip from '@/components/Common/Tooltip';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import { BlockSkeleton } from '@/components/Skeletons/Block';
import convertor from '@/libs/convertor';
import formatter from '@/libs/formatter';
import { getBlock } from '@/libs/rpc';
import { nsToDateTime, numberFormat, shortenString } from '@/libs/utils';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const Block: PageLayout = () => {
  const router = useRouter();
  const { hash } = router.query;
  const rpcUrl = useRpcStore((state) => state.rpc);
  const providers = useNetworkStore((state) => state.providers);
  const { formatNumber } = formatter();
  const { gasToTgas, yoctoToNear } = convertor();

  const [block, setBlock] = useState<null | RpcResultBlock>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const blockId = useMemo(() => {
    if (!hash || Array.isArray(hash)) return null;
    const value = hash.trim();
    if (!value) return null;

    if (value.length >= 43 || isNaN(Number(value))) return value;

    const asNumber = Number(value);
    return Number.isNaN(asNumber) ? value : asNumber;
  }, [hash]);

  const rpcEndpoint = rpcUrl || providers?.[0]?.url;

  const rpc = useMemo(() => {
    if (!rpcEndpoint) return null;
    return new RPC(rpcEndpoint);
  }, [rpcEndpoint]);

  useEffect(() => {
    if (!rpc || blockId == null) return;

    let cancelled = false;

    const fetchBlock = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await getBlock(rpc, blockId);

        if (cancelled) return;

        if (resp?.result) {
          setBlock(resp.result);
        } else {
          setBlock(null);
          setError('Block not found');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching block data:', err);
        setBlock(null);
        setError('Failed to load block');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBlock();

    return () => {
      cancelled = true;
    };
  }, [rpc, blockId]);

  const header = block?.header;
  const chunks = block?.chunks || [];

  const shards = header?.chunks_included ?? 0;

  const gas = useMemo(() => {
    let limit = 0;
    let used = 0;
    let fee = '0';
    if (block) {
      limit = chunks.reduce((acc, curr) => acc + curr.gas_limit, 0);
      used = chunks.reduce((acc, curr) => acc + curr.gas_used, 0);
      fee = Big(used)
        .mul(Big(String(header?.gas_price)))
        .toString();
    }
    return { fee, limit, used };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  return (
    <>
      <Meta
        description={`Near Block Hash ${hash}. The block height, timestamp, block gas used, gas price, author of the block are detailed on Near.`}
        title={`Near Block ${hash} | Near Validate`}
      />
      <div className="relative container mx-auto">
        {header?.height !== undefined && (
          <div className="pt-7 pb-[26px] px-5">
            <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
              {numberFormat(String(header.height))}
              <Copy
                buttonClassName="ml-3"
                className="text-primary w-6"
                text={String(header.height)}
              />
            </h1>
          </div>
        )}

        {loading && <BlockSkeleton />}

        {!loading && error && <Error title="Error Fetching Block" />}

        {!loading && !error && block && (
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Hash</h2>
              <div className="font-heading font-medium text-[26px]">
                <Tooltip tooltip={header?.hash ?? ''}>
                  {shortenString(header?.hash ?? '')}
                </Tooltip>
                {header?.hash && (
                  <Copy
                    buttonClassName="ml-2"
                    className="text-primary w-4"
                    text={header.hash}
                  />
                )}
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Time (UTC)</h2>
              <div className="font-heading font-medium text-[24px]">
                {nsToDateTime(
                  header?.timestamp_nanosec ?? '0',
                  'YYYY-MM-DD HH:mm:ss',
                )}{' '}
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Author</h2>
              <div className="font-heading font-medium text-[26px]">
                {block?.author ? (
                  <>
                    <Tooltip tooltip={block.author}>
                      <Link href={`/address/${block.author}`}>
                        {shortenString(block?.author ?? '')}
                      </Link>
                    </Tooltip>
                    <Copy
                      buttonClassName="ml-2"
                      className="text-primary w-4"
                      text={block?.author}
                    />
                  </>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Gas Used</h2>
              <div className="font-heading font-medium text-[26px]">
                {formatNumber(gasToTgas(String(gas?.used)), 0)} Tgas
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Gas Price</h2>
              <div className="font-heading font-medium text-[26px]">
                {formatNumber(gasToTgas(header?.gas_price ?? '0'), 4)} Ⓝ / Tgas
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Gas Limit</h2>

              <div className="font-heading font-medium text-[26px]">
                {formatNumber(gasToTgas(String(gas?.limit)), 0)} Tgas
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Gas Fee</h2>
              <div className="font-heading font-medium text-[26px]">
                {formatNumber(yoctoToNear(String(gas?.fee)), 6)} Ⓝ
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Shards</h2>
              <div className="font-heading font-medium text-[26px]">
                {shards}
              </div>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Parent Hash</h2>
              <div className="font-heading font-medium text-[26px]">
                {header?.prev_hash ? (
                  <>
                    <Tooltip tooltip={header.prev_hash}>
                      <Link href={`/blocks/${header?.prev_hash}`}>
                        {shortenString(header?.prev_hash ?? '')}
                      </Link>
                    </Tooltip>
                    <Copy
                      buttonClassName="ml-2"
                      className="text-primary w-4"
                      text={header.prev_hash}
                    />
                  </>
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

Block.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Block;
