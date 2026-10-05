import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { RpcResultBlock } from 'nb-near';

import ErrorState from '@/components/Atoms/Error';
import Tooltip from '@/components/Atoms/Tooltip';
import CopyButton from '@/components/CopyButton';
import Skeleton from '@/components/Skeleton';
import { nsToDateTime, yoctoToNear } from '@/libs/convertor';
import { rpcFetch } from '@/libs/fetcher';
import { formatNumber } from '@/libs/formatter';
import { depositAmount, getTxnState, shortenString, txnFee } from '@/libs/txn';
import type {
  ActionView,
  ExecutionOutcomeWithIdView,
  FinalExecutionOutcomeWithReceiptView,
} from '@/types/near';

import Status from './Status';
import Tabs from './Tabs';

type TxnProps = {
  hash?: string;
  rpcUrl: string;
};

const fetchStatus = (
  rpcUrl: string,
  hash: string,
  signal: AbortSignal,
  retries?: number,
) =>
  rpcFetch<FinalExecutionOutcomeWithReceiptView>(
    rpcUrl,
    'EXPERIMENTAL_tx_status',
    { sender_account_id: 'bowen', tx_hash: hash, wait_until: 'NONE' },
    { retries, signal },
  );

const fetchBlock = (rpcUrl: string, blockHash: string, signal: AbortSignal) =>
  rpcFetch<RpcResultBlock>(
    rpcUrl,
    'block',
    { block_id: blockHash },
    { signal },
  );

const POLL_INTERVAL = 5000;

const Txn = ({ hash, rpcUrl }: TxnProps) => {
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [txn, setTxn] = useState<FinalExecutionOutcomeWithReceiptView | null>(
    null,
  );
  const [block, setBlock] = useState<null | RpcResultBlock>(null);
  const [blockFailed, setBlockFailed] = useState(false);
  const state = txn ? getTxnState(txn.status) : undefined;
  const blockHash =
    state && state !== 'pending'
      ? txn?.transaction_outcome.block_hash
      : undefined;
  const blockLoading = loading || (!!blockHash && !block && !blockFailed);

  useEffect(() => {
    if (!rpcUrl || !hash) return;

    const controller = new AbortController();
    const { signal } = controller;

    setTxn(null);
    setBlock(null);
    setBlockFailed(false);
    setLoading(true);
    fetchStatus(rpcUrl, hash, signal)
      .then((response) => {
        setTxn(response);
        setError(null);
      })
      .catch((err) => !signal.aborted && setError(err))
      .finally(() => !signal.aborted && setLoading(false));

    return () => controller.abort();
  }, [hash, rpcUrl]);

  useEffect(() => {
    if (!blockHash || !rpcUrl) return;

    const controller = new AbortController();
    const { signal } = controller;

    setBlockFailed(false);
    fetchBlock(rpcUrl, blockHash, signal)
      .then(setBlock)
      .catch(() => !signal.aborted && setBlockFailed(true));

    return () => controller.abort();
  }, [blockHash, rpcUrl]);

  useEffect(() => {
    if (state !== 'pending' || !rpcUrl || !hash) return;

    const controller = new AbortController();
    const { signal } = controller;

    const timer = setInterval(() => {
      fetchStatus(rpcUrl, hash, signal, 0)
        .then(setTxn)
        .catch(() => undefined);
    }, POLL_INTERVAL);

    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [state, hash, rpcUrl]);

  if (error) return <ErrorState title="Error Fetching Txn" />;

  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton
          className="block h-[48px] lg:h-[54px] w-[300px]"
          loading={loading}
        >
          <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
            <span className="truncate">{shortenString(hash ?? '')}</span>
            <CopyButton
              buttonClassName="ml-3"
              className="text-primary w-6"
              text={hash ?? ''}
            />
          </h1>
        </Skeleton>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Status data={loading ? null : txn} />
        </div>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">From</h2>
          <Skeleton className="block h-[39px] w-[200px]" loading={loading}>
            <div className="font-heading font-medium text-[26px]">
              <Tooltip tooltip={txn?.transaction.signer_id}>
                <Link href={`/address/${txn?.transaction.signer_id}`}>
                  {shortenString(txn?.transaction.signer_id ?? '')}
                </Link>
              </Tooltip>
              <CopyButton
                buttonClassName="ml-1"
                className="text-primary w-4"
                text={txn?.transaction.signer_id ?? ''}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">To</h2>
          <Skeleton className="block h-[39px] w-[200px]" loading={loading}>
            <div className="font-heading font-medium text-[26px]">
              <Tooltip tooltip={txn?.transaction.receiver_id}>
                <Link href={`/address/${txn?.transaction.receiver_id}`}>
                  {shortenString(txn?.transaction.receiver_id ?? '')}
                </Link>
              </Tooltip>
              <CopyButton
                buttonClassName="ml-1"
                className="text-primary w-4"
                text={txn?.transaction.receiver_id ?? ''}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Block</h2>
          <Skeleton className="block h-[39px] w-32" loading={blockLoading}>
            <div className="font-heading font-medium text-[26px]">
              {!block ? (
                '-'
              ) : (
                <Tooltip
                  tooltip={
                    <span>
                      <span className="mr-1">{block?.header.hash}</span>
                      <CopyButton
                        buttonClassName="h-4 align-text-bottom"
                        className="w-4"
                        text={block?.header.hash ?? ''}
                      />
                    </span>
                  }
                >
                  <Link href={`/blocks/${block?.header.height}`}>
                    {formatNumber(String(block?.header.height ?? 0), 0)}
                  </Link>
                </Tooltip>
              )}
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Time (UTC)</h2>
          <Skeleton className="block h-[39px] w-[280px]" loading={blockLoading}>
            <div className="font-heading font-medium text-[24px]">
              {!block
                ? '-'
                : nsToDateTime(
                    block?.header.timestamp_nanosec ?? '0',
                    'YYYY-MM-DD HH:mm:ss',
                  )}
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Amount</h2>
          <Skeleton className="block h-[39px] w-28" loading={loading}>
            <div className="font-heading font-medium text-[24px]">
              {formatNumber(
                yoctoToNear(
                  depositAmount(
                    (txn?.transaction.actions as ActionView[]) ?? [],
                  ),
                ),
                6,
              )}{' '}
              Ⓝ
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Fee</h2>
          <Skeleton className="block h-[39px] w-[140px]" loading={loading}>
            <div className="font-heading font-medium text-[24px]">
              {formatNumber(
                yoctoToNear(
                  txnFee(
                    (txn?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                      [],
                    txn?.transaction_outcome.outcome.tokens_burnt ?? '0',
                  ),
                ),
                6,
              )}{' '}
              Ⓝ
            </div>
          </Skeleton>
        </div>
      </div>
      <Tabs data={loading ? null : txn} />
    </div>
  );
};

export default Txn;
