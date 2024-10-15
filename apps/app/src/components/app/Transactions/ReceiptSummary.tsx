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
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import ReceiptSummaryRow from './Receipts/ReceiptSummaryRow';
import { useTranslations } from 'next-intl';
import { useRpcStore } from '@/stores/rpc';
import useRpc from '@/hooks/useRpc';
import FileSlash from '../Icons/FileSlash';

interface Props {
  txn: TransactionInfo;
  loading: boolean;
  price: string;
  hash: string;
}

const ReceiptSummary = (props: Props) => {
  const { txn: txnData, loading, price, hash } = props;
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const { transactionStatus, getBlockDetails } = useRpc();
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [rpcData, setRpcData] = useState<any>({});

  const txn = txnData ? txnData : rpcData;

  const t = useTranslations();
  const [receipt, setReceipt] = useState<any>(null);
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
      setReceipt(transactionReceipts(rpcTxn));
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
        <div className=" text-sm text-nearblue-600 dark:text-neargray-10 dark:divide-black-200 divide-solid divide-gray-200 divide-y">
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
            <>
              <div className="relative overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y rounded-xl dark:divide-black-200 dark:border-black-200">
                  <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
                    <tr>
                      <th
                        scope="col"
                        className="pl-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      ></th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        Receipt
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        Action
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        Method
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        {t ? t('txn.receipts.from.text.0') : 'From'}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      ></th>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        {t ? t('txn.receipts.to.text.0') : 'To'}
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                      >
                        Gas Limit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                    {(!receipt?.id || loading) &&
                      [...Array(10)].map((_, i) => (
                        <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                            <Skeleton className="w-full h-4" />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                            <Skeleton className="w-full h-4" />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-tiny ">
                            <Skeleton className="w-full h-4" />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                            <Skeleton className="w-full h-4" />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                            <Skeleton className="w-full h-4" />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                            <Skeleton className="w-full h-4" />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                            <Skeleton className="w-full h-4" />
                          </td>
                        </tr>
                      ))}
                    {receipt?.actions?.length === 0 && (
                      <tr className="h-[57px]">
                        <td
                          colSpan={100}
                          className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
                        >
                          <ErrorMessage
                            icons={<FaInbox />}
                            message="No access keys"
                            mutedText="Please try again later"
                          />
                        </td>
                      </tr>
                    )}
                    {receipt?.id && (
                      <ReceiptSummaryRow
                        txn={txn}
                        receipt={receipt}
                        price={price}
                      />
                    )}{' '}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
export default ReceiptSummary;
