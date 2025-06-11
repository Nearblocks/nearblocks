'use client';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

import { mapRpcActionToAction } from '@/utils/near';
import { ApiTxnData, RPCTransactionInfo, TransactionInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaHourglassStart from '@/components/app/Icons/FaHourglassStart';
import FileSlash from '@/components/app/Icons/FileSlash';
import Skeleton, { Loader } from '@/components/app/skeleton/common/Skeleton';
import TreeReceipt from '@/components/app/Transactions/TreeReceipts/TreeReceipt';
import TreeReceiptDetails from '@/components/app/Transactions/TreeReceipts/TreeReceiptDetails';

interface Props {
  hash: string;
  rpcTxn: RPCTransactionInfo;
  txn: TransactionInfo;
  apiTxnActionsData: ApiTxnData;
}

const Tree = (props: Props) => {
  const { hash, rpcTxn, txn, apiTxnActionsData } = props;

  const [rpcReceipt, setRpcReceipt] = useState<any>(null);

  const receipt = apiTxnActionsData?.receiptData
    ? apiTxnActionsData?.receiptData
    : rpcReceipt;

  const [show, setShow] = useState<any>(receipt?.receipt_id);

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
                receiptItem?.receipt?.Action?.actions?.map((receipt) =>
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
      const receipt = transactionReceipts(rpcTxn);
      setRpcReceipt(receipt);
      setShow(receipt?.receipt_id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn, apiTxnActionsData?.receiptData]);

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
            <div
              className={`w-full ${
                !receipt?.id || (!receipt?.receipt_id && 'h-96')
              }`}
            >
              <div className="p-4 md:px-8">
                {!receipt?.id && !receipt?.receipt_id ? (
                  <div className="md:flex justify-center w-full lg:h-[36vh]">
                    <div className="w-full md:w-7/12 lg:w-2/3 xl:w-3/4 ">
                      <div className="py-2">
                        <Skeleton className="w-full h-80" />
                      </div>
                    </div>
                    <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4">
                      <div className="text-green-500 dark:text-green-250 text-base pt-3 pl-3">
                        Receipt
                      </div>
                      <div className="w-full pl-3 py-3 flex items-center text-sm gap-2">
                        Status:
                        <div className="w-full md:w-3/4">
                          <Loader wrapperClassName="flex w-20 max-w-xl" />
                        </div>
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center text-sm gap-2">
                        From: <Skeleton className="w-52 h-4" />
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center text-sm gap-2">
                        To: <Skeleton className="w-52 h-4" />
                      </div>
                      <div className="w-full pl-3 word-break space-y-4">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-10" />
                      </div>

                      <div className="text-green-500 dark:text-green-250 text-base pt-3 pl-3">
                        Execution Outcomes
                      </div>
                      <div className="pl-3 py-2 text-sm">
                        <span>Logs:</span>

                        <div className="w-full break-words space-y-4">
                          <Skeleton className="w-full h-6" />
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
                            receipt={receipt}
                            setShow={setShow}
                            show={show}
                            txn={txn}
                          />
                        </li>
                      </ul>
                    </div>
                    <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4">
                      <TreeReceiptDetails
                        receipt={receipt}
                        show={show}
                        txn={txn}
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
