/**
 * Component: TransactionsTreeReceiptDetails
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt on Near Protocol.
 */
interface Props {
  ownerId: string;
  network: string;
  txn: TransactionInfo;
  t: (key: string) => string | undefined;
  receipt: ReceiptsPropsInfo | any;
  className: string;
  show: string | any;
}

import TreeTxnsActions from '@/includes/Common/TreeReceipts/TreeTxnsActions';
import { ReceiptsPropsInfo, TransactionInfo } from '@/includes/types';

export default function (props: Props) {
  const { network, receipt, t, ownerId, txn, show } = props;

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
                receipt?.actions?.map((action: any, i: number) => (
                  <Fragment key={1}>
                    <div className="text-green-500 dark:text-green-250 text-xl pt-3 px-1">
                      Receipt
                    </div>
                    <div className="w-full pl-3 py-2 flex items-center">
                      Predecessor:{' '}
                      <Link
                        href={`/address/${receipt?.predecessor_id}`}
                        className="text-green-500 dark:text-green-250 font-medium inline-block truncate max-w-[120px] ml-0.5"
                      >
                        {receipt.predecessor_id}
                      </Link>
                    </div>
                    <div className="w-full pl-3 py-2 flex items-center">
                      Receiver:{' '}
                      <Link
                        href={`/address/${receipt?.receiver_id}`}
                        className="text-green-500 dark:text-green-250 font-medium inline-block truncate max-w-[120px] ml-0.5"
                      >
                        {` ${receipt.receiver_id}`}
                      </Link>
                    </div>
                    <div className="w-full pl-3 word-break space-y-4">
                      <TreeTxnsActions
                        key={i}
                        action={action}
                        receiver={receipt?.receiver_id}
                        t={t}
                        ownerId={ownerId}
                      />
                    </div>
                  </Fragment>
                ))}
              <div className="text-green-500 dark:text-green-250 text-xl px-1 pt-3">
                Execution Outcomes
              </div>
              <div className="pl-3 py-2">
                <span className="text-base">Logs:</span>
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
                          <Widget
                            src={`${ownerId}/widget/includes.Common.TreeReceipts.TreeNode`}
                            props={{
                              node: receipt?.outcome?.logs,
                              path: 'root',
                              ownerId,
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      'No Logs'
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
          {receipt?.outcome?.outgoing_receipts?.map((rcpt: any) => (
            <Fragment key={rcpt?.receipt_id}>
              <Widget
                src={`${ownerId}/widget/bos-components.components.Transactions.TreeReceiptDetails`}
                props={{
                  network: network,
                  t: t,
                  txn: txn,
                  receipt: rcpt,
                  className: ``,
                  show,
                  ownerId,
                }}
              />
            </Fragment>
          ))}
        </>
      )}
    </>
  );
}
