/**
 * Component: TransactionsReceipt
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt on Near Protocol.
 */

import ArrowDown from '@/includes/icons/ArrowDown';
import { TransactionReceiptInfo } from '@/includes/types';

export default function (props: TransactionReceiptInfo) {
  const {
    network,
    t,
    receipt,
    fellowOutgoingReceipts,
    expandAll,
    convertionReceipt,
    className,
    ownerId,
  } = props;

  const [isTxTypeActive, setTxTypeActive] = useState(false);
  const switchActiveTxType = useCallback(
    () => setTxTypeActive((x) => !x),
    [setTxTypeActive],
  );

  useEffect(() => switchActiveTxType, [expandAll, switchActiveTxType]);

  const remainingFellowOutgoingReceipts = fellowOutgoingReceipts.slice(0, -1);
  const lastFellowOutgoingReceipt = fellowOutgoingReceipts.at(-1);
  const filterRefundNestedReceipts =
    receipt?.outcome.nestedReceipts &&
    receipt?.outcome.nestedReceipts.filter(
      (nestedReceipt: any) =>
        'outcome' in nestedReceipt && nestedReceipt.predecessorId !== 'system',
    );
  const nonRefundNestedReceipts =
    filterRefundNestedReceipts && filterRefundNestedReceipts.slice(0, -1);
  const lastNonRefundNestedReceipt =
    filterRefundNestedReceipts && filterRefundNestedReceipts.at(-1);

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
              {receipt?.predecessorId}
            </div>
          </div>
        ) : null}

        {lastFellowOutgoingReceipt ? (
          <Widget
            src={`${ownerId}/widget/bos-components.components.Transactions.TransactionReceipt`}
            props={{
              network: network,
              t,
              receipt: lastFellowOutgoingReceipt,
              expandAll: expandAll,
              fellowOutgoingReceipts: remainingFellowOutgoingReceipts,
              convertionReceipt: false,
              className: 'pb-4 !mt-0 border-l mt-2.5 ml-2.5',
              ownerId,
            }}
          />
        ) : null}
        <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
          {receipt?.actions &&
            receipt?.actions.map((action: any, index: number) => (
              <Widget
                key={`${action.kind}_${index}`}
                src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptKind`}
                props={{
                  network: network,
                  t,
                  action: action,
                  onClick: switchActiveTxType,
                  isTxTypeActive: isTxTypeActive,
                  ownerId,
                }}
              />
            ))}
        </div>
        {isTxTypeActive ? (
          <div className="border-l border-green-500 dark:border-green-250 ml-2.5">
            <Widget
              src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptInfo`}
              props={{
                network: network,
                t,
                receipt: receipt,
                ownerId,
              }}
            />
          </div>
        ) : null}
        <div className="relative flex flex-row my-2.5">
          <ArrowDown
            className={`absolute left-0.5 -top-5 ml-px  w-4 h-4 fill-current text-green-500 dark:text-green-250`}
          />
          <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
          <div className="text-green-500 dark:text-green-250 text-sm ">
            {receipt?.receiverId}
          </div>
        </div>
      </div>
      {lastNonRefundNestedReceipt ? (
        <Widget
          src={`${ownerId}/widget/bos-components.components.Transactions.TransactionReceipt`}
          props={{
            network: network,
            t: t,
            receipt: lastNonRefundNestedReceipt,
            expandAll: expandAll,
            fellowOutgoingReceipts: nonRefundNestedReceipts,
            convertionReceipt: false,
            className: ` !pl-0 !border-transparent`,
            ownerId,
          }}
        />
      ) : null}
    </>
  );
}
