import { Fragment } from 'react';
import { Link } from '@/i18n/routing';
import { ReceiptsPropsInfo, TransactionInfo } from '@/utils/types';
import Tooltip from '../../common/Tooltip';
import TxnsReceiptStatus from '../../common/TxnsReceiptStatus';
import TreeNode from './TreeNode';
import TreeTxnsActions from './TreeTxnsActions';

interface Props {
  receipt: any | ReceiptsPropsInfo;
  rpcReceipt: any | ReceiptsPropsInfo;
  show: any | string;
  txn: TransactionInfo;
}

const TreeReceiptDetails = (props: Props) => {
  const { receipt, show, txn, rpcReceipt } = props;

  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (('SuccessValue' in status &&
      status.SuccessValue !== null &&
      status.SuccessValue !== undefined) ||
      'SuccessReceiptId' in status);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 py-0.5 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  return (
    <>
      {show === receipt.receipt_id && (
        <>
          {!receipt ? (
            <div className="w-full">
              <Loader wrapperClassName="flex w-full my-1 max-w-xs" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          ) : receipt?.actions ? (
            <>
              {receipt &&
                receipt?.actions?.map((_: any, i: number) => {
                  const rpcAction = rpcReceipt?.actions?.[i];
                  return (
                    <Fragment key={i}>
                      <div className="text-green-500 dark:text-green-250 text-base pt-3 pl-3">
                        Receipt
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center">
                        Status:
                        {!receipt ? (
                          <div className="w-full md:w-3/4">
                            <Loader wrapperClassName="flex w-full max-w-xl" />
                          </div>
                        ) : (
                          <div className="w-full md:w-3/4 break-words ml-2">
                            {receipt?.outcome?.status !== undefined && (
                              <TxnsReceiptStatus showLabel status={isSuccess} />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center">
                        <span className="flex-shrink-0">From:</span>
                        <div className="flex-1 min-w-0 ml-2">
                          <Tooltip
                            className="left-1/2 max-w-[200px]"
                            position="top"
                            tooltip={receipt.predecessor_id}
                          >
                            <Link
                              className="text-green-500 dark:text-green-250 font-medium block truncate"
                              href={`/address/${receipt?.predecessor_id}`}
                            >
                              {receipt.predecessor_id}
                            </Link>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="w-full pl-3 py-2 flex items-center">
                        <span className="flex-shrink-0">To:</span>
                        <div className="flex-1 min-w-0 ml-2">
                          <Tooltip
                            className="left-1/2 max-w-[200px]"
                            position="top"
                            tooltip={receipt.receiver_id}
                          >
                            <Link
                              className="text-green-500 dark:text-green-250 font-medium block truncate"
                              href={`/address/${receipt?.receiver_id}`}
                            >
                              {receipt.receiver_id}
                            </Link>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="w-full pl-3 word-break space-y-4">
                        <TreeTxnsActions
                          action={rpcAction}
                          key={i}
                          receiver={receipt?.receiver_id}
                        />
                      </div>
                    </Fragment>
                  );
                })}
              <div className="text-green-500 dark:text-green-250 text-base pt-3 pl-3">
                Execution Outcomes
              </div>
              <div className="pl-3 py-2">
                <span>Logs:</span>
                {!receipt ? (
                  <div className="w-full">
                    <Loader wrapperClassName="flex w-full" />
                    <Loader wrapperClassName="flex w-full" />
                    <Loader wrapperClassName="flex w-full" />
                  </div>
                ) : (
                  <div className="w-full break-words space-y-4">
                    {receipt?.outcome?.logs?.length > 0 ? (
                      <>
                        <div className="mt-3 bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 overflow-auto rounded-lg">
                          <TreeNode node={receipt?.outcome?.logs} path="root" />
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 overflow-auto rounded-lg">
                        No Logs
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            ''
          )}
        </>
      )}
      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <>
          {receipt?.outcome?.outgoing_receipts?.map(
            (rcpt: any, index: number) => {
              const childRpcReceipt =
                rpcReceipt?.outcome?.outgoing_receipts?.[index] || null;

              return (
                <Fragment key={rcpt?.receipt_id}>
                  <TreeReceiptDetails
                    receipt={rcpt}
                    show={show}
                    txn={txn}
                    rpcReceipt={childRpcReceipt}
                  />
                </Fragment>
              );
            },
          )}
        </>
      )}
    </>
  );
};

export default TreeReceiptDetails;
