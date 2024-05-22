/**
 * Component: TransactionsReceiptSummary
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: List of Transaction Receipt Summary on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {TransactionInfo} [txn] - Information related to a transaction.
 * @param {RPCTransactionInfo} [rpcTxn] - RPC data of the transaction.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  txn: TransactionInfo;
  rpcTxn: RPCTransactionInfo;
}

import ErrorMessage from '@/includes/Common/ErrorMessage';
import Skeleton from '@/includes/Common/Skeleton';
import FaHourglassStart from '@/includes/icons/FaHourglassStart';
import FaInbox from '@/includes/icons/FaInbox';
import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';
export default function (props: Props) {
  const { network, rpcTxn, txn, t, ownerId } = props;

  const { mapRpcActionToAction } = VM.require(
    `${ownerId}/widget/includes.Utils.near`,
  );
  const [receipt, setReceipt] = useState<any>(null);
  function transactionReceipts(txn: RPCTransactionInfo) {
    const actions: any =
      txn?.transaction?.actions &&
      txn?.transaction?.actions?.map((txn) => mapRpcActionToAction(txn));
    const receipts = txn?.receipts;
    const receiptsOutcome = txn?.receipts_outcome;

    if (
      receipts?.length === 0 ||
      receipts[0]?.receipt_id !== receiptsOutcome[0]?.id
    ) {
      receipts?.unshift({
        predecessor_id: txn?.transaction?.signer_id,
        receipt: actions,
        receipt_id: receiptsOutcome[0]?.id,
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

    return collectReceipts(receiptsOutcome[0]?.id);
  }

  useEffect(() => {
    if (rpcTxn) {
      const receipt = transactionReceipts(rpcTxn);
      setReceipt(receipt);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn]);

  const txnsPending = txn?.outcomes?.status === null;
  return (
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
              <thead className="bg-gray-100 dark:bg-black-300">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  >
                    Method
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  >
                    {t ? t('txns:txn.receipts.from.text.0') : 'From'}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  ></th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  >
                    {t ? t('txns:txn.receipts.to.text.0') : 'To'}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  >
                    Value
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                  >
                    Gas Limit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
                {!receipt?.id &&
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
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
                    </tr>
                  ))}
                {receipt?.actions?.length === 0 && (
                  <tr className="h-[57px]">
                    <td
                      colSpan={100}
                      className="px-6 py-4 text-nearblue-700 dark:text-gray-400 text-xs"
                    >
                      <ErrorMessage
                        icons={<FaInbox />}
                        message="No access keys"
                        mutedText="Please try again later"
                      />
                    </td>
                  </tr>
                )}
                {receipt?.id && (
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptSummaryRow`}
                    props={{
                      txn: txn,
                      receipt: receipt,
                      network: network,
                      t: t,
                      ownerId,
                    }}
                  />
                )}{' '}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
