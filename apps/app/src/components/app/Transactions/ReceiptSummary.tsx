'use client';
import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { mapRpcActionToAction } from '@/utils/near';
import { ApiTxnData, RPCTransactionInfo, TransactionInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaHourglassStart from '@/components/app/Icons/FaHourglassStart';
import FaInbox from '@/components/app/Icons/FaInbox';
import FileSlash from '@/components/app/Icons/FileSlash';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import ReceiptSummaryRow from '@/components/app/Transactions/Receipts/ReceiptSummaryRow';

interface Props {
  hash: string;
  loading: boolean;
  price: string;
  rpcTxn: RPCTransactionInfo;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  txn: TransactionInfo;
  apiTxnActionsData: ApiTxnData;
}

const ReceiptSummary = (props: Props) => {
  const { hash, loading, price, rpcTxn, statsData, txn, apiTxnActionsData } =
    props;

  const t = useTranslations();
  const [rpcReceipt, setRpcReceipt] = useState<any>(null);

  const receipt = apiTxnActionsData?.receiptData
    ? apiTxnActionsData?.receiptData
    : rpcReceipt;

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

    return collectReceipts(receiptsOutcome?.[0]?.id);
  }

  useEffect(() => {
    if (!isEmpty(rpcTxn)) {
      setRpcReceipt(transactionReceipts(rpcTxn));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn]);

  const txnsPending = txn?.outcomes?.status === null && !rpcTxn?.status;
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
                        className="pl-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      ></th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        Receipt
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        Action
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        Method
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        {t ? t('txnDetails.receipts.from.text.0') : 'From'}
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      ></th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        {t ? t('txnDetails.receipts.to.text.0') : 'To'}
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        Value
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                        scope="col"
                      >
                        Gas Limit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                    {((!receipt?.id && !receipt?.receipt_id) || loading) &&
                      [...Array(10)].map((_, i) => (
                        <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
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
                          className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
                          colSpan={100}
                        >
                          <ErrorMessage
                            icons={<FaInbox />}
                            message="No access keys"
                            mutedText="Please try again later"
                          />
                        </td>
                      </tr>
                    )}
                    {(receipt?.id || receipt?.receipt_id) && (
                      <ReceiptSummaryRow
                        price={price}
                        receipt={receipt}
                        statsData={statsData}
                        txn={txn}
                      />
                    )}
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
