'use client';
import {
  calculateGasUsed,
  calculateTotalDeposit,
  calculateTotalGas,
  collectNestedReceiptWithOutcomeOld,
  parseOutcomeOld,
  parseReceipt,
  txnFee,
} from '@/utils/near';
import {
  ExecutionOutcomeWithIdView,
  FailedToFindReceipt,
  NestedReceiptWithOutcome,
  RPCTransactionInfo,
  TransactionInfo,
} from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import FaHourglassStart from '../Icons/FaHourglassStart';
import Skeleton from '../skeleton/common/Skeleton';
import TransactionReceipt from './Receipts/TransactionReceipt';
import { isEmpty } from 'lodash';
import useRpc from '@/hooks/useRpc';
import { useRpcStore } from '@/stores/rpc';
import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';

interface Props {
  txn: TransactionInfo;
  hash: string;
}

const Execution = (props: Props) => {
  const { txn: txnData, hash } = props;
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const { transactionStatus, getBlockDetails } = useRpc();
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [rpcData, setRpcData] = useState<any>({});

  const txn = txnData ? txnData : rpcData;

  const [receipt, setReceipt] = useState<
    NestedReceiptWithOutcome | FailedToFindReceipt | any
  >(null);

  const [expandAll, setExpandAll] = useState(false);
  const expandAllReceipts = useCallback(
    () => setExpandAll((x) => !x),
    [setExpandAll],
  );

  function transactionReceipts(txn: RPCTransactionInfo) {
    const receiptsMap =
      txn?.receipts_outcome &&
      txn?.receipts_outcome.reduce((mapping, receiptOutcome) => {
        const receipt = parseReceipt
          ? parseReceipt(
              txn.receipts.find(
                (rpcReceipt) => rpcReceipt.receipt_id === receiptOutcome.id,
              ),
              receiptOutcome,
              txn.transaction,
            )
          : '';
        return mapping.set(receiptOutcome.id, {
          ...receipt,
          outcome: parseOutcomeOld ? parseOutcomeOld(receiptOutcome) : '',
        });
      }, new Map());

    const receipts = collectNestedReceiptWithOutcomeOld
      ? collectNestedReceiptWithOutcomeOld(
          txn.transaction_outcome.outcome.receipt_ids[0],
          receiptsMap,
        )
      : '';

    return receipts;
  }

  useEffect(() => {
    const checkTxnExistence = async () => {
      if (txn === null) {
        try {
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
        } catch (error) {}
      }
    };

    checkTxnExistence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, hash, rpcUrl]);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      if (!txn) return;

      try {
        const res = await transactionStatus(
          txn.transaction_hash,
          txn.signer_account_id,
        );
        setRpcTxn(res);
      } catch {}
    };

    fetchTransactionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, rpcUrl]);

  useEffect(() => {
    if (!isEmpty(rpcTxn)) {
      setReceipt(transactionReceipts(rpcTxn));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn, receipt?.block_hash]);
  const txnsPending = txn?.outcomes?.status === null;
  return (
    <>
      {!txn ? (
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
            <ErrorMessage
              icons={<FileSlash />}
              message="Sorry, we are unable to locate this transaction hash. Please try using a
        different RPC."
              mutedText={hash || ''}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-nearblue-600 dark:text-neargray-10 dark:divide-black-200  divide-solid divide-gray-200 divide-y">
          {txnsPending ? (
            <div className="flex justify-center text-base p-24">
              <div className="text-center">
                <div className="inline-flex items-center text-base rounded bg-yellow-50 dark:bg-black-200 text-yellow-500 animate-spin my-3">
                  <FaHourglassStart className="w-5 !h-5" />
                </div>

                <h1 className="text-lg text-nearblue-600 dark:text-neargray-10">
                  This transaction is pending confirmation.
                </h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full mx-auto divide-y dark:divide-black-200">
              <div className="flex justify-end w-full p-4 items-center">
                <div
                  className="cursor-pointer mx-1 flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-1 border border-neargray-700 dark:border-black-200 px-2 rounded-md bg-whit select-none"
                  onClick={() => expandAllReceipts()}
                >
                  <span>
                    <span className="mr-1.5">
                      {expandAll ? 'Collapse All' : 'Expand All'}
                    </span>
                    {expandAll ? '-' : '+'}
                  </span>
                </div>
              </div>
              <div className="p-4 md:px-8 overflow-auto">
                {!receipt?.id ? (
                  <div>
                    <div className="flex flex-row mb-2.5">
                      <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                      <div className="text-green-500 dark:text-green-250 text-sm">
                        <Skeleton className="w-40 h-4" />
                      </div>
                    </div>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="border-green-500 dark:border-green-250"
                      >
                        <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
                          <Skeleton className="w-25 h-8" />
                        </div>
                        <div className="relative flex flex-row my-2.5">
                          <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                          <div className="text-green-500 dark:text-green-250 text-sm ">
                            <Skeleton className="w-40 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <TransactionReceipt
                    receipt={receipt}
                    expandAll={expandAll}
                    fellowOutgoingReceipts={[]}
                    convertionReceipt={true}
                    className=""
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Execution;
