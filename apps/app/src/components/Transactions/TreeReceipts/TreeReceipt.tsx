import { ReceiptsPropsInfo, TransactionInfo } from '@/utils/types';
import { Fragment } from 'react';

interface Props {
  txn: TransactionInfo;
  receipt: ReceiptsPropsInfo | any;
  setShow: (id: string) => void | any;
  show: string;
}

const TreeReceipt = (props: Props) => {
  const { receipt, txn, setShow, show } = props;

  function formatActionKind(actionKind: string) {
    return actionKind.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  return (
    <>
      {receipt?.actions && (
        <div
          onClick={() => {
            setShow(receipt.receipt_id);
          }}
          className={`${
            show === receipt.receipt_id
              ? '!text-white bg-green-500 dark:bg-green-250'
              : 'text-green-500'
          } !border-2 !border-solid !border-green-600 dark:!border-green-250 dark:text-green-250 !rounded-lg cursor-pointer`}
        >
          {receipt?.actions.map((action: any, index: number) => (
            <p
              key={index}
              className="flex flex-col dark:divide-black-200 divide-gray-200 divide-y"
            >
              {formatActionKind(action.action_kind)}
              {action.args?.method_name && <p>({action.args?.method_name})</p>}
            </p>
          ))}
        </div>
      )}
      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <ul>
          {receipt?.outcome?.outgoing_receipts?.map((rcpt: any) => (
            <Fragment key={rcpt?.receipt_id}>
              <li>
                <TreeReceipt
                  txn={txn}
                  receipt={rcpt}
                  setShow={setShow}
                  show={show}
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
