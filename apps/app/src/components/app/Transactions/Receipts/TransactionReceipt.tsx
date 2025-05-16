import { TransactionReceiptInfo } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import ReceiptKind from '@/components/app/Transactions/Receipts/ReceiptKind';
import ReceiptInfo from '@/components/app/Transactions/Receipts/ReceiptInfo';
import ArrowDown from '@/components/app/Icons/ArrowDown';

const TransactionReceipt = (props: TransactionReceiptInfo) => {
  const {
    receipt,
    rpcReceipt,
    fellowOutgoingReceipts,
    rpcFellowOutgoingReceipts,
    expandAll,
    convertionReceipt,
    className,
    statsData,
    rpcTxn,
  } = props;

  const [isTxTypeActive, setTxTypeActive] = useState(false);
  const switchActiveTxType = useCallback(() => setTxTypeActive((x) => !x), []);
  useEffect(() => {}, [setTxTypeActive, isTxTypeActive]);
  useEffect(() => {
    setTxTypeActive(expandAll);
  }, [expandAll]);

  const remainingFellowOutgoingReceipts = fellowOutgoingReceipts?.slice(0, -1);
  const rpcRemainingFellowOutgoingReceipts = rpcFellowOutgoingReceipts?.slice(
    0,
    -1,
  );
  const lastFellowOutgoingReceipt = fellowOutgoingReceipts?.at(-1);
  const rpcLastFellowOutgoingReceipt = rpcFellowOutgoingReceipts?.at(-1);
  const filterRefundNestedReceipts =
    (receipt?.outcome?.nestedReceipts &&
      receipt?.outcome?.nestedReceipts?.filter(
        (nestedReceipt: any) =>
          'outcome' in nestedReceipt &&
          nestedReceipt?.predecessorId !== 'system',
      )) ||
    receipt?.outcome?.outgoing_receipts.filter(
      (nestedReceipt: any) =>
        'outcome' in nestedReceipt &&
        nestedReceipt?.predecessor_id !== 'system',
    );
  const rpcFilterRefundNestedReceipts =
    rpcReceipt?.outcome?.nestedReceipts &&
    rpcReceipt?.outcome?.nestedReceipts?.filter(
      (nestedReceipt: any) =>
        'outcome' in nestedReceipt && nestedReceipt?.predecessorId !== 'system',
    );

  const nonRefundNestedReceipts =
    filterRefundNestedReceipts && filterRefundNestedReceipts?.slice(0, -1);
  const lastNonRefundNestedReceipt =
    filterRefundNestedReceipts && filterRefundNestedReceipts?.at(-1);

  const rpcNonRefundNestedReceipts =
    rpcFilterRefundNestedReceipts &&
    rpcFilterRefundNestedReceipts?.slice(0, -1);
  const rpcLastNonRefundNestedReceipt =
    rpcFilterRefundNestedReceipts && rpcFilterRefundNestedReceipts?.at(-1);
  return (
    <>
      <div
        className={`${
          convertionReceipt
            ? 'pl-0 border-transparent'
            : 'pl-4 md:pl-8 border-green-500 dark:border-green-250'
        } ${className} `}
      >
        {convertionReceipt ? (
          <div className="flex flex-row mb-2.5">
            <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
            <div className="text-green-500 dark:text-green-250 text-sm">
              {receipt?.predecessor_id || receipt?.predecessorId}
            </div>
          </div>
        ) : null}

        {lastFellowOutgoingReceipt || rpcLastFellowOutgoingReceipt ? (
          <TransactionReceipt
            receipt={lastFellowOutgoingReceipt}
            rpcReceipt={rpcLastFellowOutgoingReceipt}
            expandAll={expandAll}
            fellowOutgoingReceipts={remainingFellowOutgoingReceipts}
            rpcFellowOutgoingReceipts={rpcRemainingFellowOutgoingReceipts}
            convertionReceipt={false}
            className="pb-4 !mt-0 border-l ml-2.5"
            statsData={statsData}
            rpcTxn={rpcTxn}
          />
        ) : null}
        <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
          {receipt?.actions?.map((action: any, index: number) => {
            const matchingAction = rpcReceipt?.actions?.find(
              (rpcAction: any) => rpcAction?.methodName === action?.method_name,
            );
            return (
              <ReceiptKind
                key={`${action?.action_kind || action?.kind}_${index}`}
                action={action}
                rpcAction={matchingAction}
                onClick={switchActiveTxType}
                isTxTypeActive={isTxTypeActive}
                receiver={receipt?.receiver_id || receipt?.receiverId}
                receipt={receipt}
              />
            );
          })}
        </div>
        {isTxTypeActive ? (
          <div className="border-l border-green-500 dark:border-green-250 ml-2.5">
            <ReceiptInfo
              receipt={receipt}
              rpcReceipt={rpcReceipt}
              statsData={statsData}
              rpcTxn={rpcTxn}
            />
          </div>
        ) : null}
        <div className="relative flex flex-row my-2.5">
          <ArrowDown
            className={`absolute left-0.5 -top-5 ml-px  w-4 h-4 fill-current text-green-500 dark:text-green-250`}
          />
          <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
          <div className="text-green-500 dark:text-green-250 text-sm ">
            {receipt?.receiver_id || receipt?.receiverId}
          </div>
        </div>
      </div>
      {lastNonRefundNestedReceipt || rpcLastNonRefundNestedReceipt ? (
        <TransactionReceipt
          receipt={lastNonRefundNestedReceipt}
          rpcReceipt={rpcLastNonRefundNestedReceipt}
          expandAll={expandAll}
          fellowOutgoingReceipts={nonRefundNestedReceipts}
          rpcFellowOutgoingReceipts={rpcNonRefundNestedReceipts}
          className="!pl-0 !border-transparent"
          convertionReceipt={false}
          statsData={statsData}
          rpcTxn={rpcTxn}
        />
      ) : null}
    </>
  );
};
export default TransactionReceipt;
