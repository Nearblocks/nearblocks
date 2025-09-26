import { TransactionReceiptInfo } from '@/utils/types';
import { useCallback, useEffect, useState } from 'react';
import ReceiptKind from '@/components/app/Transactions/Receipts/ReceiptKind';
import ReceiptInfo from '@/components/app/Transactions/Receipts/ReceiptInfo';
import ArrowDown from '@/components/app/Icons/ArrowDown';

const TransactionReceipt = (props: TransactionReceiptInfo) => {
  const {
    receipt,
    polledReceipt,
    fellowOutgoingReceipts,
    polledFellowOutgoingReceipts,
    expandAll,
    convertionReceipt,
    className,
    statsData,
    rpcTxn,
    rpcReceipt,
    rpcRootReceipt,
  } = props;
  const [isTxTypeActive, setTxTypeActive] = useState(false);
  const switchActiveTxType = useCallback(() => setTxTypeActive((x) => !x), []);
  useEffect(() => {}, [setTxTypeActive, isTxTypeActive]);
  useEffect(() => {
    setTxTypeActive(expandAll);
  }, [expandAll]);

  const getChildId = (r: any) => r?.receipt_id || r?.id;

  const getAllRpcNestedReceipts = (rpcData: any): any[] => {
    if (!rpcData) return [];

    let collected: any[] = [];

    const children =
      rpcData?.outcome?.nestedReceipts ||
      rpcData?.outcome?.outgoing_receipts ||
      rpcData?.receipts_outcome ||
      [];

    collected = [...children];

    children.forEach((child: any) => {
      collected = [...collected, ...getAllRpcNestedReceipts(child)];
    });

    return collected;
  };

  const rpcBase = rpcRootReceipt || rpcReceipt;
  const allRpcReceipts = rpcBase
    ? [rpcBase, ...getAllRpcNestedReceipts(rpcBase)]
    : [];

  const findMatchingRpcReceipt = (targetReceipt: any) => {
    if (!targetReceipt) return null;
    const targetId = getChildId(targetReceipt);
    return allRpcReceipts?.find((r: any) => getChildId(r) === targetId) || null;
  };

  const findMatchingRpcReceiptHeuristic = (targetReceipt: any) => {
    if (!targetReceipt) return null;
    const targetReceiver =
      targetReceipt?.receiver_id || targetReceipt?.receiverId;
    const targetActions = targetReceipt?.actions || [];
    const targetMethod =
      targetActions?.[0]?.args?.method_name ||
      targetActions?.[0]?.args?.methodName;

    const candidate = allRpcReceipts?.find((r: any) => {
      const rReceiver = r?.receiverId || r?.receiver_id;
      if (rReceiver !== targetReceiver) return false;
      const rMethod =
        r?.actions?.[0]?.args?.methodName || r?.actions?.[0]?.args?.method_name;
      return targetMethod && rMethod ? rMethod === targetMethod : true;
    });
    return candidate || null;
  };

  const remainingFellowOutgoingReceipts = fellowOutgoingReceipts?.slice(0, -1);
  const polledRemainingFellowOutgoingReceipts =
    polledFellowOutgoingReceipts?.slice(0, -1);
  const lastFellowOutgoingReceipt = fellowOutgoingReceipts?.at(-1);
  const polledLastFellowOutgoingReceipt = polledFellowOutgoingReceipts?.at(-1);

  const filterRefundNestedReceipts =
    (receipt?.outcome?.nestedReceipts &&
      receipt?.outcome?.nestedReceipts?.filter(
        (nestedReceipt: any) =>
          'outcome' in nestedReceipt &&
          nestedReceipt?.predecessorId !== 'system',
      )) ||
    receipt?.outcome?.outgoing_receipts?.filter(
      (nestedReceipt: any) =>
        'outcome' in nestedReceipt &&
        nestedReceipt?.predecessor_id !== 'system',
    ) ||
    [];

  const polledFilterRefundNestedReceipts =
    (polledReceipt?.outcome?.nestedReceipts &&
      polledReceipt?.outcome?.nestedReceipts?.filter(
        (nestedReceipt: any) =>
          'outcome' in nestedReceipt &&
          nestedReceipt?.predecessorId !== 'system',
      )) ||
    polledReceipt?.outcome?.outgoing_receipts?.filter(
      (nestedReceipt: any) =>
        'outcome' in nestedReceipt &&
        nestedReceipt?.predecessor_id !== 'system',
    ) ||
    [];

  const allNestedReceipts = filterRefundNestedReceipts || [];
  const allPolledNestedReceipts = polledFilterRefundNestedReceipts || [];

  const nonRefundNestedReceipts = allNestedReceipts?.slice(0, -1);
  const lastNonRefundNestedReceipt = allNestedReceipts?.at(-1);

  const polledNonRefundNestedReceipts = allPolledNestedReceipts?.slice(0, -1);
  const polledLastNonRefundNestedReceipt = allPolledNestedReceipts?.at(-1);

  const rpcForLastNonRefund =
    findMatchingRpcReceipt(
      polledLastNonRefundNestedReceipt || lastNonRefundNestedReceipt,
    ) ||
    findMatchingRpcReceiptHeuristic(
      polledLastNonRefundNestedReceipt || lastNonRefundNestedReceipt,
    );

  const rpcForFellowLast =
    findMatchingRpcReceipt(
      polledLastFellowOutgoingReceipt || lastFellowOutgoingReceipt,
    ) ||
    findMatchingRpcReceiptHeuristic(
      polledLastFellowOutgoingReceipt || lastFellowOutgoingReceipt,
    );

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

        {lastFellowOutgoingReceipt || polledLastFellowOutgoingReceipt ? (
          <TransactionReceipt
            receipt={lastFellowOutgoingReceipt}
            polledReceipt={polledLastFellowOutgoingReceipt}
            expandAll={expandAll}
            fellowOutgoingReceipts={remainingFellowOutgoingReceipts}
            polledFellowOutgoingReceipts={polledRemainingFellowOutgoingReceipts}
            convertionReceipt={false}
            className="pb-4 !mt-0 border-l ml-2.5"
            statsData={statsData}
            rpcTxn={rpcTxn}
            rpcReceipt={rpcForFellowLast}
            rpcRootReceipt={rpcBase}
          />
        ) : null}

        <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
          {polledReceipt?.actions?.map((action: any, actionIndex: number) => {
            const matchingAction = polledReceipt?.actions?.[actionIndex];
            return (
              <ReceiptKind
                key={`${action.action_kind || action.kind}_${actionIndex}`}
                action={action}
                polledAction={matchingAction}
                onClick={switchActiveTxType}
                isTxTypeActive={isTxTypeActive}
                receiver={receipt?.receiver_id || receipt?.receiverId}
                receipt={polledReceipt || receipt}
                rpcAction={rpcReceipt?.actions}
              />
            );
          })}
        </div>

        {isTxTypeActive ? (
          <div className="border-l border-green-500 dark:border-green-250 ml-2.5">
            <ReceiptInfo
              receipt={receipt}
              polledReceipt={polledReceipt}
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

      {lastNonRefundNestedReceipt || polledLastNonRefundNestedReceipt ? (
        <TransactionReceipt
          receipt={lastNonRefundNestedReceipt}
          polledReceipt={polledLastNonRefundNestedReceipt}
          expandAll={expandAll}
          fellowOutgoingReceipts={nonRefundNestedReceipts}
          polledFellowOutgoingReceipts={polledNonRefundNestedReceipts}
          className="!pl-0 !border-transparent"
          convertionReceipt={false}
          statsData={statsData}
          rpcTxn={rpcTxn}
          rpcReceipt={rpcForLastNonRefund as any}
          rpcRootReceipt={rpcBase}
        />
      ) : null}
    </>
  );
};
export default TransactionReceipt;
