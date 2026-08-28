import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { RPC } from 'nb-near';

import Copy from '@/components/Common/Copy';
import Error from '@/components/Common/Error';
import Tooltip from '@/components/Common/Tooltip';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import Skeleton from '@/components/Skeleton';
import TxnTabs from '@/components/Transaction/TxnTabs';
import convertor from '@/libs/convertor';
import formatter from '@/libs/formatter';
import { getBlock, getTxn } from '@/libs/rpc';
import {
  depositAmount,
  nsToDateTime,
  shortenString,
  txnFee,
} from '@/libs/utils';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

interface TransactionData {
  receipts_outcome: any[];
  transaction: {
    actions: any[];
    hash: string;
    receiver_id: string;
    signer_id: string;
  };
  transaction_outcome: {
    block_hash: string;
    outcome: {
      tokens_burnt: string;
    };
  };
}

interface BlockData {
  header: {
    hash: string;
    height: number;
    timestamp_nanosec: string;
  };
}

const Txn: PageLayout = () => {
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState({
    block: true,
    txn: true,
  });
  const [txn, setTxn] = useState<null | TransactionData>(null);
  const [block, setBlock] = useState<BlockData | null>(null);
  const router = useRouter();
  const { hash } = router.query;
  const rpcUrl = useRpcStore((state) => state.rpc);
  const providers = useNetworkStore((state) => state.providers);
  const { yoctoToNear } = convertor();
  const { formatNumber } = formatter();

  useEffect(() => {
    const currentRpcUrl = rpcUrl || providers?.[0]?.url;
    if (!currentRpcUrl || !hash) return;

    let cancelled = false;

    const fetchTransactionData = async () => {
      setLoading((state) => ({ ...state, block: true, txn: true }));

      try {
        const rpcEndpoint = new RPC(currentRpcUrl);
        const resp = await getTxn(rpcEndpoint, hash as string);

        if (cancelled) return;

        if (resp?.result) {
          setTxn(resp.result);
          setError(null);

          setLoading((state) => ({ ...state, txn: false }));

          try {
            const blockResp = await getBlock(
              rpcEndpoint,
              resp.result?.transaction_outcome?.block_hash,
            );

            if (cancelled) return;

            if (blockResp?.result) {
              setBlock(blockResp.result);
              setError(null);
            }
          } catch (blockErr) {
            if (cancelled) return;
            console.error('Error fetching block data:', blockErr);
            setError(blockErr);
          } finally {
            if (!cancelled) {
              setLoading((state) => ({ ...state, block: false }));
            }
          }
        } else {
          setTxn(null);
          setError('Transaction not found');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching transaction data:', err);
        setTxn(null);
        setError(err);
      } finally {
        if (!cancelled) {
          setLoading((state) => ({ ...state, txn: false }));
        }
      }
    };

    fetchTransactionData();

    return () => {
      cancelled = true;
    };
  }, [rpcUrl, providers, hash]);

  return (
    <>
      <Meta
        description={`Near Blockchain detailed info for transaction ${
          hash ?? ''
        }.`}
        title={`Near Transaction ${hash ?? ''} | Near Validate`}
      />
      {error && <Error title="Error Fetching Transaction" />}
      {!error && (
        <div className="relative container mx-auto">
          <div className="pt-7 pb-[26px] px-5">
            <Skeleton
              className="block h-[48px] lg:h-[54px] w-[300px]"
              loading={loading.txn}
            >
              <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
                <span className="truncate">
                  {shortenString(hash as string)}
                </span>
                <Copy
                  buttonClassName="ml-3"
                  className="text-primary w-6"
                  text={hash as string}
                />
              </h1>
            </Skeleton>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">From</h2>
              <Skeleton
                className="block h-[39px] w-[200px]"
                loading={loading.txn}
              >
                <div className="font-heading font-medium text-[26px]">
                  <Tooltip tooltip={txn?.transaction?.signer_id}>
                    <Link href={`/address/${txn?.transaction.signer_id}`}>
                      {shortenString(txn?.transaction?.signer_id ?? '')}
                    </Link>
                  </Tooltip>
                  <Copy
                    buttonClassName="ml-2"
                    className="text-primary w-4"
                    text={txn?.transaction.signer_id as string}
                  />
                </div>
              </Skeleton>
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">To</h2>
              <Skeleton
                className="block h-[39px] w-[200px]"
                loading={loading.txn}
              >
                <div className="font-heading font-medium text-[26px]">
                  <Tooltip tooltip={txn?.transaction?.receiver_id}>
                    <Link href={`/address/${txn?.transaction?.receiver_id}`}>
                      {shortenString(txn?.transaction.receiver_id ?? '')}
                    </Link>
                  </Tooltip>
                  <Copy
                    buttonClassName="ml-2"
                    className="text-primary w-4"
                    text={txn?.transaction.receiver_id as string}
                  />
                </div>
              </Skeleton>
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Block</h2>
              <Skeleton className="block h-[39px] w-32" loading={loading.block}>
                <div className="flex items-center font-heading font-medium text-[26px]">
                  <Tooltip
                    tooltip={
                      <span>
                        <span className="mr-1">{block?.header.hash}</span>
                        <Copy
                          buttonClassName="ml-1 h-4 align-text-bottom"
                          className="w-4"
                          text={block?.header.hash as string}
                        />
                      </span>
                    }
                  >
                    <Link href={`/blocks/${block?.header.height}`}>
                      {formatNumber(String(block?.header.height ?? 0), 0)}
                    </Link>
                  </Tooltip>
                </div>
              </Skeleton>
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Time (UTC)</h2>
              <Skeleton
                className="block h-[39px] w-[280px]"
                loading={loading.block}
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
              <h2 className="font-medium text-sm mb-0.5">Amount</h2>
              <Skeleton className="block h-[39px] w-28" loading={loading.txn}>
                <div className="font-heading font-medium text-[24px]">
                  {formatNumber(
                    yoctoToNear(depositAmount(txn?.transaction.actions ?? [])),
                    6,
                  )}{' '}
                  Ⓝ
                </div>
              </Skeleton>
            </div>
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Fee</h2>
              <Skeleton
                className="block h-[39px] w-[140px]"
                loading={loading.txn}
              >
                <div className="font-heading font-medium text-[24px]">
                  {formatNumber(
                    yoctoToNear(
                      txnFee(
                        txn?.receipts_outcome ?? [],
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
          <TxnTabs hash={hash as string} rpcUrl={rpcUrl} />
        </div>
      )}
    </>
  );
};

Txn.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Txn;
