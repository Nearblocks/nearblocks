'use client';

import { ApiTxnData, TransactionInfo } from '@/utils/types';
import { ReceiptsPropsInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaHourglassStart from '@/components/app/Icons/FaHourglassStart';
import FileSlash from '@/components/app/Icons/FileSlash';
import ReceiptRow from '@/components/app/Transactions/Receipts/ReceiptRow';
import { mapRpcActionToAction } from '@/utils/app/near';
import { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { RpcTransactionResponse } from '@near-js/jsonrpc-types';

interface Props {
  hash: string;
  rpcTxn: RpcTransactionResponse;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  txn: TransactionInfo;
  apiTxnActionsData: ApiTxnData;
  shouldUseRpc: boolean;
  hasReceipts: boolean;
}

const Receipt = (props: Props) => {
  const {
    hash,
    statsData,
    txn,
    rpcTxn,
    apiTxnActionsData,
    shouldUseRpc,
    hasReceipts,
  } = props;
  const [rpcReceipt, setReceipt] = useState<null | ReceiptsPropsInfo>(null);

  function transactionReceipts(txn: RpcTransactionResponse) {
    const actions: any =
      txn?.transaction?.actions &&
      txn?.transaction?.actions?.map((txn) => mapRpcActionToAction(txn));
    const receipts = 'receipts' in txn ? txn?.receipts : [];
    const receiptsOutcome = txn?.receiptsOutcome;

    if (
      receipts?.length === 0 ||
      receipts?.[0]?.receiptId !== receiptsOutcome?.[0]?.id
    ) {
      receipts?.unshift({
        predecessorId: txn?.transaction?.signerId,
        receipt: actions,
        receiptId: receiptsOutcome?.[0]?.id,
        receiverId: txn?.transaction?.receiverId,
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
        receiptsByIdMap?.set(receiptItem?.receiptId, {
          ...receiptItem,
          actions:
            receiptItem?.receiptId === receiptsOutcome[0]?.id
              ? actions
              : receiptItem?.receipt && 'Action' in receiptItem.receipt
              ? receiptItem.receipt.Action?.actions?.map((receipt) =>
                  mapRpcActionToAction(receipt),
                )
              : undefined,
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
            receiptOutcome?.outcome?.receiptIds &&
            receiptOutcome?.outcome?.receiptIds?.map(collectReceipts),
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

  const receipt = !apiTxnActionsData?.receiptData
    ? rpcReceipt
    : apiTxnActionsData?.receiptData;

  const polledReceipt =
    shouldUseRpc || hasReceipts === false || !apiTxnActionsData?.receiptData
      ? rpcReceipt
      : apiTxnActionsData?.receiptData;
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
        <div className="text-sm text-nearblue-600 dark:text-neargray-10 dark:divide-black-200 divide-solid divide-gray-200 divide-y">
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
            <ReceiptRow
              receipt={receipt}
              statsData={statsData}
              polledReceipt={polledReceipt}
              rpcReceipt={rpcReceipt}
            />
          )}
        </div>
      )}
    </>
  );
};
export default Receipt;
