import Big from 'big.js';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { RpcResultBlock } from 'nb-near';

import ErrorState from '@/components/Atoms/Error';
import Tooltip from '@/components/Atoms/Tooltip';
import CopyButton from '@/components/CopyButton';
import Skeleton from '@/components/Skeleton';
import { nsToDateTime, yoctoToNear, yoctoToTgas } from '@/libs/convertor';
import { rpcFetch } from '@/libs/fetcher';
import { formatNumber } from '@/libs/formatter';
import { shortenString } from '@/libs/txn';

type BlockProps = {
  hash?: string;
  rpcUrl: string;
};

const Block = ({ hash, rpcUrl }: BlockProps) => {
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<null | RpcResultBlock>(null);

  useEffect(() => {
    if (!rpcUrl || !hash) return;

    const controller = new AbortController();
    const { signal } = controller;
    const blockId = !isNaN(Number(hash)) ? Number(hash) : hash;

    setLoading(true);
    rpcFetch<RpcResultBlock>(rpcUrl, 'block', { block_id: blockId }, { signal })
      .then((response) => {
        setBlock(response);
        setError(null);
      })
      .catch((err) => !signal.aborted && setError(err))
      .finally(() => !signal.aborted && setLoading(false));

    return () => controller.abort();
  }, [hash, rpcUrl]);

  const gas = useMemo(() => {
    let limit = 0;
    let used = 0;
    let fee = '0';

    if (block) {
      limit = block.chunks.reduce((acc, curr) => acc + curr.gas_limit, 0);
      used = block.chunks.reduce((acc, curr) => acc + curr.gas_used, 0);
      fee = Big(used).mul(Big(block.header.gas_price)).toString();
    }

    return { fee, limit, used };
  }, [block]);

  if (error) return <ErrorState title="Error Fetching Block" />;

  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton className="block h-[48px] lg:h-[54px] w-56" loading={loading}>
          <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
            {formatNumber(String(block?.header.height ?? 0), 2)}
            <CopyButton
              buttonClassName="ml-3"
              className="text-primary w-6"
              text={String(block?.header.height)}
            />
          </h1>
        </Skeleton>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Hash</h2>
          <Skeleton
            className="block h-[39px] w-48 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              <Tooltip tooltip={block?.header.hash}>
                {shortenString(block?.header.hash ?? '')}
              </Tooltip>
              <CopyButton
                buttonClassName="ml-1"
                className="text-primary w-4"
                text={block?.header.hash ?? ''}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Time (UTC)</h2>
          <Skeleton
            className="block h-[39px] w-60 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[24px]">
              {nsToDateTime(
                block?.header.timestamp_nanosec ?? '0',
                'YYYY-MM-DD HH:mm:ss',
              )}
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Author</h2>
          <Skeleton
            className="block h-[39px] w-52 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              <Tooltip tooltip={block?.author}>
                <Link href={`/address/${block?.author}`}>
                  {shortenString(block?.author ?? '')}
                </Link>
              </Tooltip>
              <CopyButton
                buttonClassName="ml-1"
                className="text-primary w-4"
                text={block?.author ?? ''}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Used</h2>
          <Skeleton
            className="block h-[39px] w-32 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToTgas(String(gas.used)), 0)} Tgas
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Price</h2>
          <Skeleton
            className="block h-[39px] w-48 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToTgas(block?.header.gas_price ?? '0'), 4)} Ⓝ /
              Tgas
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Limit</h2>
          <Skeleton
            className="block h-[39px] w-36 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToTgas(String(gas.limit)), 0)} Tgas
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Fee</h2>
          <Skeleton
            className="block h-[39px] w-36 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToNear(gas.fee), 6)} Ⓝ
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Shards</h2>
          <Skeleton
            className="block h-[39px] w-10 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {block?.header.chunks_included ?? 0}
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Parent Hash</h2>
          <Skeleton
            className="block h-[39px] w-48 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              <Tooltip tooltip={block?.header.prev_hash}>
                <Link href={`/blocks/${block?.header.prev_hash}`}>
                  {shortenString(block?.header.prev_hash ?? '')}
                </Link>
              </Tooltip>
              <CopyButton
                buttonClassName="ml-1"
                className="text-primary w-4"
                text={block?.header.prev_hash ?? ''}
              />
            </div>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default Block;
