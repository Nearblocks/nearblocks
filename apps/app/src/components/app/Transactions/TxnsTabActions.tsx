'use client';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { Link } from '@/i18n/routing';
import { useRpcStore } from '@/stores/app/rpc';
import {
  calculateGasUsed,
  calculateTotalDeposit,
  calculateTotalGas,
  txnFee,
} from '@/utils/near';
import { mapRpcActionToAction } from '@/utils/near';
import {
  ExecutionOutcomeWithIdView,
  ReceiptsPropsInfo,
  RPCTransactionInfo,
} from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';
import Details from './Details';
import Execution from './Execution';
import Receipt from './Receipt';
import ReceiptSummary from './ReceiptSummary';
import Tree from './Tree';

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
  status,
  apiTxnActionsData,
}: any) => {
  const { getBlockDetails, transactionStatus } = useRpc();
  const [rpcError, setRpcError] = useState(false);
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [rpcData, setRpcData] = useState<any>({});
  const [allRpcProviderError, setAllRpcProviderError] = useState(false);
  const initializedRef = useRef(false);
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [receipt, setReceipt] = useState<null | ReceiptsPropsInfo>(null);

  function transactionReceipts(txn: RPCTransactionInfo) {
    const actions: any =
      txn?.transaction?.actions &&
      txn?.transaction?.actions?.map((txn) => mapRpcActionToAction(txn));
    const receipts = txn?.receipts;
    const receiptsOutcome = txn?.receipts_outcome;

    if (
      receipts?.length === 0 ||
      receipts?.[0]?.receipt_id !== receiptsOutcome?.[0]?.id
    ) {
      receipts?.unshift({
        predecessor_id: txn?.transaction?.signer_id,
        receipt: actions,
        receipt_id: receiptsOutcome?.[0]?.id,
        receiver_id: txn?.transaction?.receiver_id,
      });
    }

    const receiptOutcomesByIdMap = new Map();
    const receiptsByIdMap = new Map();

    receiptsOutcome &&
      receiptsOutcome?.forEach((receipt) => {
        receiptOutcomesByIdMap?.set(receipt?.id, receipt);
      });

    receipts &&
      receipts?.forEach((receiptItem) => {
        receiptsByIdMap?.set(receiptItem?.receipt_id, {
          ...receiptItem,
          actions:
            receiptItem?.receipt_id === receiptsOutcome?.[0]?.id
              ? actions
              : receiptItem?.receipt?.Action?.actions &&
                receiptItem?.receipt?.Action?.actions.map((receipt) =>
                  mapRpcActionToAction(receipt),
                ),
        });
      });

    const collectReceipts = (receiptHash: any) => {
      const receipt = receiptsByIdMap?.get(receiptHash);
      const receiptOutcome = receiptOutcomesByIdMap?.get(receiptHash);

      return {
        ...receipt,
        ...receiptOutcome,
        outcome: {
          ...receiptOutcome?.outcome,
          outgoing_receipts:
            receiptOutcome?.outcome?.receipt_ids &&
            receiptOutcome?.outcome?.receipt_ids?.map(collectReceipts),
        },
      };
    };

    return collectReceipts(receiptsOutcome?.[0]?.id);
  }

  useEffect(() => {
    if (!isEmpty(rpcTxn)) {
      setReceipt(transactionReceipts(rpcTxn));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn]);

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

  const { rpc: rpcUrl, switchRpc } = useRpcStoreWithProviders();

  useEffect(() => {
    if (txn != null && txn?.outcomes?.status === null) {
      const delay = Math.min(1000 * 2 ** retryCount.current, 150000);
      timeoutRef.current = setTimeout(() => {
        router.refresh();
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
      if (txn === undefined || txn === null || !txn) {
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
            actions_agg: {
              deposit: calculateTotalDeposit(txnExists?.transaction.actions),
              gas_attached: calculateTotalGas(txnExists?.transaction.actions),
            },
            block: { block_height: block?.header.height },
            block_timestamp: block?.header.timestamp_nanosec,
            included_in_block_hash: txnExists.transaction_outcome.block_hash,
            outcomes: { status: status },
            outcomes_agg: {
              gas_used: calculateGasUsed(
                (txnExists?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                  [],
                txnExists?.transaction_outcome.outcome.gas_burnt ?? '0',
              ),
              transaction_fee: txnFee(
                (txnExists?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                  [],
                txnExists?.transaction_outcome.outcome.tokens_burnt ?? '0',
              ),
            },
            receipt_conversion_gas_burnt:
              txnExists.transaction_outcome.outcome.gas_burnt.toString(),
            receipt_conversion_tokens_burnt:
              txnExists.transaction_outcome.outcome.tokens_burnt,
            receiver_account_id: txnExists.transaction.receiver_id,
            signer_account_id: txnExists.transaction.signer_id,
            transaction_hash: txnExists.transaction_outcome.id,
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
        if (res?.final_execution_status === 'NONE') {
          setRpcError(true);
        }
        setRpcTxn(res);
      } catch {
        setRpcError(true);
      }
    };

    fetchTransactionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, rpcUrl]);

  const tabs = [
    { label: 'Overview', message: 'txn.tabs.overview', name: 'overview' },
    {
      label: 'Execution Plan',
      message: 'txn.tabs.execution',
      name: 'execution',
    },
    { label: 'Enhanced Plan', message: 'tokenTxns', name: 'enhanced' },
    { label: 'Tree Plan', message: 'nftTokenTxns', name: 'tree' },
    { label: 'Reciept Summary', message: 'accessKeys', name: 'summary' },
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

  return (
    <>
      <div className="container-xxl mx-auto px-5 -z">
        {(rpcError && (!txn || allRpcProviderError)) ||
        rpcTxn?.final_execution_status === 'NONE' ? (
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
                    isContract={contract}
                    loading={false}
                    price={price ? String(price) : ''}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    txn={txn ? txn : rpcData}
                    status={status}
                    apiTxnActionsData={apiTxnActionsData}
                  />
                )}
                {tab === 'execution' && (
                  <Receipt
                    hash={hash}
                    receipt={receipt}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    txn={txn ? txn : rpcData}
                    apiTxnActionsData={apiTxnActionsData}
                  />
                )}
                {tab === 'enhanced' && (
                  <Execution
                    hash={hash}
                    rpcTxn={rpcTxn}
                    txn={txn ? txn : rpcData}
                    statsData={stats}
                  />
                )}
                {tab === 'tree' && (
                  <Tree hash={hash} rpcTxn={rpcTxn} txn={txn ? txn : rpcData} />
                )}
                {tab === 'summary' && (
                  <ReceiptSummary
                    hash={hash}
                    loading={false}
                    price={price ? String(price) : ''}
                    rpcTxn={rpcTxn}
                    statsData={stats}
                    txn={txn ? txn : rpcData}
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
