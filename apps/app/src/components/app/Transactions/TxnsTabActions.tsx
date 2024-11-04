'use client';
import { useEffect, useRef, useState } from 'react';
import Details from './Details';
import Execution from './Execution';
import Receipt from './Receipt';
import ReceiptSummary from './ReceiptSummary';
import Tree from './Tree';
import {
  calculateGasUsed,
  calculateTotalDeposit,
  calculateTotalGas,
  txnFee,
} from '@/utils/near';
import { ExecutionOutcomeWithIdView } from '@/utils/types';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useRpcStore } from '@/stores/app/rpc';
import { useRouter } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import classNames from 'classnames';
import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';
import useRpc from '@/hooks/app/useRpc';

export type RpcProvider = {
  name: string;
  url: string;
};

const TxnsTabActions = ({ tab, txn, stats, isContract, price, hash }: any) => {
  const { transactionStatus, getBlockDetails } = useRpc();
  const [rpcError, setRpcError] = useState(false);
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [rpcData, setRpcData] = useState<any>({});
  const [allRpcProviderError, setAllRpcProviderError] = useState(false);
  const initializedRef = useRef(false);
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const useRpcStoreWithProviders = () => {
    const setProviders = useRpcStore((state) => state.setProviders);
    const { RpcProviders } = useRpcProvider();
    useEffect(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setProviders(RpcProviders);
      }
    }, [RpcProviders, setProviders]);

    return useRpcStore((state) => state);
  };

  const { switchRpc, rpc: rpcUrl } = useRpcStoreWithProviders();

  useEffect(() => {
    if (txn === null || !txn) {
      const delay = Math.min(1000 * 2 ** retryCount.current, 150000);
      timeoutRef.current = setTimeout(() => {
        router.replace(pathname);
        retryCount.current += 1;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, router, retryCount, rpcUrl]);

  useEffect(() => {
    if (rpcError) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        setAllRpcProviderError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
  }, [rpcError, switchRpc]);

  useEffect(() => {
    const checkTxnExistence = async () => {
      if (txn === undefined || txn === null) {
        try {
          setRpcError(false);
          const txnExists: any = await transactionStatus(hash, 'bowen');
          const status = txnExists.status?.Failure ? false : true;
          let block: any = {};

          if (txnExists) {
            block = await getBlockDetails(
              txnExists.transaction_outcome.block_hash,
            );
          }

          const modifiedTxns = {
            transaction_hash: txnExists.transaction_outcome.id,
            included_in_block_hash: txnExists.transaction_outcome.block_hash,
            outcomes: { status: status },
            block: { block_height: block?.header.height },
            block_timestamp: block?.header.timestamp_nanosec,
            receiver_account_id: txnExists.transaction.receiver_id,
            signer_account_id: txnExists.transaction.signer_id,
            receipt_conversion_gas_burnt:
              txnExists.transaction_outcome.outcome.gas_burnt.toString(),
            receipt_conversion_tokens_burnt:
              txnExists.transaction_outcome.outcome.tokens_burnt,
            actions_agg: {
              deposit: calculateTotalDeposit(txnExists?.transaction.actions),
              gas_attached: calculateTotalGas(txnExists?.transaction.actions),
            },
            outcomes_agg: {
              transaction_fee: txnFee(
                (txnExists?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                  [],
                txnExists?.transaction_outcome.outcome.tokens_burnt ?? '0',
              ),
              gas_used: calculateGasUsed(
                (txnExists?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                  [],
                txnExists?.transaction_outcome.outcome.gas_burnt ?? '0',
              ),
            },
          };
          if (txnExists) {
            setRpcTxn(txnExists);
            setRpcData(modifiedTxns);
          }
        } catch (error) {
          setRpcError(true);
        }
      }
    };

    checkTxnExistence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, hash, rpcUrl]);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      if (!txn) return;

      try {
        setRpcError(false);
        const res = await transactionStatus(
          txn.transaction_hash,
          txn.signer_account_id,
        );
        setRpcTxn(res);
      } catch {
        setRpcError(true);
      }
    };

    fetchTransactionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, rpcUrl]);

  const tabs = [
    { name: 'overview', message: 'txn.tabs.overview', label: 'Overview' },
    {
      name: 'execution',
      message: 'txn.tabs.execution',
      label: 'Execution Plan',
    },
    { name: 'enhanced', message: 'tokenTxns', label: 'Enhanced Plan' },
    { name: 'tree', message: 'nftTokenTxns', label: 'Tree Plan' },
    { name: 'summary', message: 'accessKeys', label: 'Reciept Summary' },
  ];

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
        'bg-green-600 dark:bg-green-250 text-white': selected,
      },
    );

  return (
    <>
      <div className="relative container mx-auto px-3">
        {rpcError && (!txn || allRpcProviderError) ? (
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
              <ErrorMessage
                icons={<FileSlash />}
                message="Sorry, we are unable to locate this transaction hash. Please try again later."
                mutedText={hash || ''}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="md:flex justify-between">
              <div className="w-fit md:flex md:gap-2">
                {tabs?.map(({ name, label }) => {
                  return (
                    <Link
                      key={name}
                      href={
                        name === 'overview'
                          ? `/txns/${hash}`
                          : `/txns/${hash}?tab=${name}`
                      }
                      className={getClassName(name === tab)}
                    >
                      <h2>
                        {label}
                        {name === 'enhanced' && (
                          <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
                            NEW
                          </div>
                        )}
                      </h2>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
              <>
                {tab === 'overview' ? (
                  <Details
                    txn={txn ? txn : rpcData}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    loading={false}
                    isContract={isContract}
                    price={price ? String(price) : ''}
                    hash={hash}
                  />
                ) : null}
                {tab === 'execution' ? (
                  <Receipt
                    txn={txn ? txn : rpcData}
                    hash={hash}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                  />
                ) : null}
                {tab === 'enhanced' ? (
                  <Execution
                    txn={txn ? txn : rpcData}
                    hash={hash}
                    rpcTxn={rpcTxn}
                  />
                ) : null}
                {tab === 'tree' ? (
                  <Tree txn={txn ? txn : rpcData} hash={hash} rpcTxn={rpcTxn} />
                ) : null}
                {tab === 'summary' ? (
                  <ReceiptSummary
                    txn={txn ? txn : rpcData}
                    loading={false}
                    price={price ? String(price) : ''}
                    hash={hash}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                  />
                ) : null}
              </>
            </div>
          </>
        )}
      </div>
      <div className="py-8"></div>
    </>
  );
};

export default TxnsTabActions;
