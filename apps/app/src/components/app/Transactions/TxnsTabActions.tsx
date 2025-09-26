'use client';
import classNames from 'classnames';
import { useIntlRouter } from '@/i18n/routing';
import { useEffect, useMemo, useRef, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import { useRpcProvider } from '@/components/app/common/RpcContext';
import {
  calculateGasUsed,
  calculateTotalDeposit,
  calculateTotalGas,
  txnFee,
} from '@/utils/near';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';
import Details from '@/components/app/Transactions/Details';
import Execution from '@/components/app/Transactions/Execution';
import Receipt from '@/components/app/Transactions/Receipt';
import ReceiptSummary from '@/components/app/Transactions/ReceiptSummary';
import Tree from '@/components/app/Transactions/Tree';
import { revalidateTxn } from '@/utils/app/actions';
import { useConfig } from '@/hooks/app/useConfig';
import { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import { useRpcTrigger } from '@/components/app/common/RpcTriggerContext';

export type RpcProvider = {
  name: string;
  url: string;
};

const TxnsTabActions = ({
  hash,
  price,
  stats,
  tab,
  txn,
  apiTxnActionsData,
  hasReceipts,
}: any) => {
  const { getBlockDetails, transactionStatus } = useRpc();
  const [rpcError, setRpcError] = useState(false);
  const [isTransactionNotFound, setIsTransactionNotFound] = useState(false);
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [rpcData, setRpcData] = useState<any>({});
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useIntlRouter();
  const { networkId } = useConfig();
  const cacheRef = useRef<Record<string, Promise<any>>>({});
  const { shouldFetchRpc, setShouldFetchRpc } = useRpcTrigger();

  // temporary use rpc data for blocks before 192373963 and api data for latest blocks - testnet
  // temporary use rpc data for blocks before 143997621 and api data for latest blocks - mainnet
  const shouldUseRpc =
    (networkId === 'testnet' && txn?.block?.block_height <= 192373963) ||
    (networkId === 'mainnet' && txn?.block?.block_height <= 143997621);

  const { rpc: rpcUrl, switchRpc, rpcStats } = useRpcProvider();

  useEffect(() => {
    if (txn != null && txn?.outcomes?.status === null) {
      const delay = Math.min(1000 * 2 ** retryCount.current, 150000);
      timeoutRef.current = setTimeout(() => {
        revalidateTxn(hash);
        retryCount.current += 1;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, router, retryCount]);

  useEffect(() => {
    if (rpcError && !isTransactionNotFound) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
  }, [txn, rpcError, isTransactionNotFound, switchRpc]);

  useEffect(() => {
    const checkTxnExistence = async () => {
      try {
        setRpcError(false);
        setIsTransactionNotFound(false);

        const res: {
          success: boolean;
          data: RpcTransactionResponse;
          statusCode: number;
          isNotFound: boolean;
          shouldRetry: boolean;
        } = await transactionStatus(rpcUrl, hash, 'bowen', cacheRef);
        if (res?.isNotFound) {
          setIsTransactionNotFound(true);
          return;
        }

        if (res?.success) {
          const txnExists = res?.data;
          let status: boolean | null = null;

          if (
            txnExists.status &&
            typeof txnExists.status === 'object' &&
            'SuccessValue' in txnExists.status
          ) {
            status = true;
          } else if (
            txnExists.status &&
            typeof txnExists.status === 'object' &&
            'Failure' in txnExists.status
          ) {
            status = false;
            console.error('Error:', txnExists.status.Failure);
          } else {
            status = null;
          }

          let block: any = {};

          if (txnExists) {
            block = await getBlockDetails(
              rpcUrl,
              txnExists?.transactionOutcome?.blockHash,
            );
          }
          const modifiedTxns = {
            actions_agg: {
              deposit: calculateTotalDeposit(txnExists?.transaction.actions),
              gas_attached: calculateTotalGas(txnExists?.transaction.actions),
            },
            block: { block_height: block?.header.height },
            block_timestamp: block?.header.timestamp_nanosec,
            included_in_block_hash: txnExists.transactionOutcome?.blockHash,
            outcomes: { status: status },
            outcomes_agg: {
              gas_used: calculateGasUsed(
                txnExists?.receiptsOutcome ?? [],
                String(txnExists?.transactionOutcome?.outcome?.gasBurnt) ?? '0',
              ),
              transaction_fee: txnFee(
                txnExists?.receiptsOutcome ?? [],
                txnExists?.transactionOutcome?.outcome?.tokensBurnt ?? '0',
              ),
            },
            receipt_conversion_gas_burnt:
              txnExists?.transactionOutcome?.outcome?.gasBurnt?.toString(),
            receipt_conversion_tokens_burnt:
              txnExists?.transactionOutcome?.outcome?.tokensBurnt,
            receiver_account_id: txnExists?.transaction?.receiverId,
            signer_account_id: txnExists?.transaction?.signerId,
            transaction_hash: txnExists?.transactionOutcome?.id,
          };
          setRpcTxn(txnExists);
          setRpcData(modifiedTxns);
          setShouldFetchRpc(false);
        } else {
          if (res?.shouldRetry !== false) {
            setRpcError(true);
          }
        }
      } catch (error) {
        setRpcError(true);
      }
    };
    if (!txn || hasReceipts === false || shouldFetchRpc) {
      checkTxnExistence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, hash, rpcUrl, hasReceipts, shouldFetchRpc]);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      try {
        setRpcError(false);
        const res = await transactionStatus(
          rpcUrl,
          txn.transaction_hash,
          txn.signer_account_id,
          cacheRef,
        );
        if (res?.isNotFound) {
          setIsTransactionNotFound(true);
          return;
        }

        if (res?.success) {
          setRpcTxn(res?.data);
        } else if (res?.shouldRetry !== false) {
          setRpcError(true);
        }
      } catch {
        setRpcError(true);
      }
    };
    if (txn && shouldUseRpc) {
      fetchTransactionStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcUrl]);

  const tabs = [
    { label: 'Overview', message: 'txn.tabs.overview', name: 'overview' },
    {
      label: 'Execution Plan',
      message: 'txn.tabs.execution',
      name: 'execution',
    },
    { label: 'Enhanced Plan', message: 'tokenTxns', name: 'enhanced' },
    { label: 'Tree Plan', message: 'nftTokenTxns', name: 'tree' },
    { label: 'Receipt Summary', message: 'accessKeys', name: 'summary' },
  ];

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium inline-block whitespace-nowrap cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 dark:hover:bg-black-100 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );

  const contract = useMemo(() => {
    const containsDelegateOrFunctionCall =
      Array.isArray(rpcTxn?.transaction?.actions) &&
      rpcTxn?.transaction?.actions.some(
        (action: any) =>
          action &&
          typeof action === 'object' &&
          ('Delegate' in action || 'FunctionCall' in action),
      );

    return containsDelegateOrFunctionCall;
  }, [rpcTxn]);

  const apiContract =
    Array.isArray(apiTxnActionsData?.apiMainActions) &&
    apiTxnActionsData?.apiMainActions.some(
      (action: any) =>
        action?.action_kind === 'FUNCTION_CALL' ||
        action?.action_kind === 'DELEGATE',
    );

  return (
    <>
      <div className="container-xxl mx-auto px-5 -z">
        {isTransactionNotFound ? (
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5">
            <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
              <ErrorMessage
                icons={<FileSlash />}
                message="Transaction hash not found. Invalid transaction hash entered."
                mutedText={hash || ''}
                errorBg
              />
            </div>
          </div>
        ) : rpcError && !txn && rpcStats?.allRpcsFailed ? (
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5">
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
              <div className="w-full overflow-x-auto">
                <div className="flex min-w-full min-h-fit pt-3 ">
                  {tabs?.map(({ label, name }) => {
                    return (
                      <Link
                        className={`${getClassName(name === tab)} `}
                        href={
                          name === 'overview'
                            ? `/txns/${hash}`
                            : `/txns/${hash}?tab=${name}`
                        }
                        key={name}
                        prefetch={true}
                      >
                        <h2 className="!relative font-semibold">
                          {label}
                          {name === 'enhanced' && (
                            <div className="!absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md -mt-4 -ml-4 px-1">
                              NEW
                            </div>
                          )}
                        </h2>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
              <>
                {tab === 'overview' && (
                  <Details
                    hash={hash}
                    isContract={apiContract || contract}
                    loading={false}
                    price={price ? String(price) : ''}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    txn={txn ? txn : rpcData}
                    apiTxnActionsData={apiTxnActionsData}
                    shouldUseRpc={shouldUseRpc}
                    hasReceipts={hasReceipts}
                  />
                )}
                {tab === 'execution' && (
                  <Receipt
                    hash={hash}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    txn={txn ? txn : rpcData}
                    apiTxnActionsData={apiTxnActionsData}
                    shouldUseRpc={shouldUseRpc}
                    hasReceipts={hasReceipts}
                  />
                )}
                {tab === 'enhanced' && (
                  <Execution
                    hash={hash}
                    rpcTxn={rpcTxn}
                    txn={txn ? txn : rpcData}
                    statsData={stats}
                    apiTxnActionsData={apiTxnActionsData}
                    shouldUseRpc={shouldUseRpc}
                    hasReceipts={hasReceipts}
                  />
                )}
                {tab === 'tree' && (
                  <Tree
                    hash={hash}
                    rpcTxn={rpcTxn}
                    txn={txn ? txn : rpcData}
                    apiTxnActionsData={apiTxnActionsData}
                    shouldUseRpc={shouldUseRpc}
                    hasReceipts={hasReceipts}
                  />
                )}
                {tab === 'summary' && (
                  <ReceiptSummary
                    hash={hash}
                    loading={false}
                    price={price ? String(price) : ''}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    txn={txn ? txn : rpcData}
                    apiTxnActionsData={apiTxnActionsData}
                    shouldUseRpc={shouldUseRpc}
                    hasReceipts={hasReceipts}
                  />
                )}
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
