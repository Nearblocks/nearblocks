import { Fragment } from 'react';

import { ReceiptsPropsInfo, TransactionInfo } from '@/utils/types';

import FaTimesCircle from '@/components/app/Icons/FaTimesCircle';

interface Props {
  receipt: any | ReceiptsPropsInfo;
  setShow: (id: string) => any | void;
  show: string;
  txn: TransactionInfo;
}

const TreeReceipt = (props: Props) => {
  const { receipt, setShow, show, txn } = props;

  function formatActionKind(actionKind: string) {
    return actionKind.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  const status = receipt?.outcome?.status;
  const isSuccess =
    status &&
    (('SuccessValue' in status &&
      status?.SuccessValue !== null &&
      status?.SuccessValue !== undefined) ||
      'SuccessReceiptId' in status);

  return (
    <>
      {receipt?.actions && (
        <div
          className={`relative ${
            show === (receipt?.receipt_id || receipt?.receiptId)
              ? '!text-white bg-green-500 dark:bg-green-900'
              : 'text-green-500 '
          } !border-2 !border-solid !border-green-600 dark:!border-green-250 dark:text-green-250 !rounded-lg cursor-pointer`}
          onClick={() => {
            setShow(receipt?.receipt_id || receipt?.receiptId);
          }}
        >
          {!isSuccess && (
            <p className="absolute text-red-500 bg-red-50 dark:bg-black top-0 right-0 text-xs inline-flex items-center rounded -mt-3 -mr-5  px-2 py-1">
              <FaTimesCircle /> <a className="ml-[6px]">Fail</a>
            </p>
          )}
          {receipt?.actions.map((action: any, index: number) => (
            <p
              className="flex flex-col dark:divide-black-200 divide-gray-200 divide-y p-0.5 inline-flex-container"
              key={index}
            >
              {formatActionKind(action.action_kind)}
              <br />
              {(action?.args?.method_name || action.args?.methodName) &&
                ` (${action?.args?.method_name || action?.args?.methodName})`}
            </p>
          ))}
        </div>
      )}
      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <ul>
          {receipt?.outcome?.outgoing_receipts?.map((rpcTxn: any) => (
            <Fragment key={rpcTxn?.receipt_id || rpcTxn?.receiptId}>
              <li>
                <TreeReceipt
                  receipt={rpcTxn}
                  setShow={setShow}
                  show={show}
                  txn={txn}
                />
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </>
  );
};
export default TreeReceipt;
