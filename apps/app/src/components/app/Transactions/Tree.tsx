'use client';
import {
  calculateGasUsed,
  calculateTotalDeposit,
  calculateTotalGas,
  mapRpcActionToAction,
  txnFee,
} from '@/utils/near';
import {
  ExecutionOutcomeWithIdView,
  RPCTransactionInfo,
  TransactionInfo,
} from '@/utils/types';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import FaHourglassStart from '../Icons/FaHourglassStart';
import Skeleton from '../skeleton/common/Skeleton';
import TreeReceipt from './TreeReceipts/TreeReceipt';
import TreeReceiptDetails from './TreeReceipts/TreeReceiptDetails';
import { useRpcStore } from '@/stores/rpc';
import useRpc from '@/hooks/useRpc';
import ErrorMessage from '../common/ErrorMessage';
import FileSlash from '../Icons/FileSlash';

interface Props {
  txn: TransactionInfo;
  hash: string;
}

const Tree = (props: Props) => {
  const { txn: txnData, hash } = props;
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const { transactionStatus, getBlockDetails } = useRpc();
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [rpcData, setRpcData] = useState<any>({});

  const txn = txnData ? txnData : rpcData;

  const [receipt, setReceipt] = useState<any>(null);
  const [show, setShow] = useState<any>(null);
  function transactionReceipts(txn: RPCTransactionInfo) {
    const actions: any =
      txn?.transaction?.actions &&
      txn?.transaction?.actions?.map((txn) => mapRpcActionToAction(txn));
    const receipts = txn?.receipts;
    const receiptsOutcome = txn?.receipts_outcome;

    if (
      receipts?.length === 0 ||
      receipts[0]?.receipt_id !== receiptsOutcome[0]?.id
    ) {
      receipts?.unshift({
        predecessor_id: txn?.transaction?.signer_id,
        receipt: actions,
        receipt_id: receiptsOutcome[0]?.id,
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
            receiptItem?.receipt_id === receiptsOutcome[0]?.id
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

    return collectReceipts(receiptsOutcome[0]?.id);
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
      const receipt = transactionReceipts(rpcTxn);
      setReceipt(receipt);
      setShow(receipt?.receipt_id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn]);

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
            <div className="w-full mx-auto">
              <div className="p-4 md:px-8">
                {!receipt?.id ? (
                  <div className="md:flex justify-center w-full lg:!h-[36vh]">
                    <div className="w-full md:w-7/12 lg:w-2/3 xl:w-3/4 ">
                      <div className="py-2 h-full">
                        <Skeleton className="w-full h-full" />{' '}
                      </div>
                    </div>
                    <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4 h-full">
                      <div className="text-green-500 dark:text-green-250 text-base pt-3 pl-3">
                        Receipt
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center">
                        From: <Skeleton className="w-full h-4" />{' '}
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center">
                        To: <Skeleton className="w-full h-4" />{' '}
                      </div>
                      <div className="w-full pl-3 word-break space-y-4">
                        <Skeleton className="w-full h-10" />{' '}
                      </div>

                      <div className="text-green-500 dark:text-green-250 text-base pt-3 pl-3">
                        Execution Outcomes
                      </div>
                      <div className="pl-3 py-2 h-full">
                        <span>Logs:</span>

                        <div className="w-full break-words space-y-4 h-full">
                          <Skeleton className="w-full h-4" />{' '}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:flex justify-center ">
                    <div className="w-full md:w-7/12 lg:w-2/3 xl:w-3/4 overflow-auto">
                      <ul className="hierarchy-tree">
                        <li>
                          <TreeReceipt
                            txn={txn}
                            receipt={receipt}
                            setShow={setShow}
                            show={show}
                          />
                        </li>
                      </ul>
                    </div>
                    <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4">
                      <TreeReceiptDetails
                        txn={txn}
                        receipt={receipt}
                        show={show}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default Tree;
