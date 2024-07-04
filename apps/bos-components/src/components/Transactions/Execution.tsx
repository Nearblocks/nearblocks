/**
 * Component: TransactionsExecution
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Alternative Style of Transaction Execution on Near Protocol.
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

import Skeleton from '@/includes/Common/Skeleton';
import FaHourglassStart from '@/includes/icons/FaHourglassStart';
import {
  TransactionInfo,
  RPCTransactionInfo,
  NestedReceiptWithOutcome,
  FailedToFindReceipt,
} from '@/includes/types';
export default function (props: Props) {
  const { network, rpcTxn, t, ownerId, txn } = props;

  const { collectNestedReceiptWithOutcomeOld, parseOutcomeOld, parseReceipt } =
    VM.require(`${ownerId}/widget/includes.Utils.near`);

  const { getConfig } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const [receipt, setReceipt] = useState<
    NestedReceiptWithOutcome | FailedToFindReceipt | any
  >(null);

  const config = getConfig ? getConfig(network) : '';

  const [expandAll, setExpandAll] = useState(false);
  const expandAllReceipts = useCallback(
    () => setExpandAll((x) => !x),
    [setExpandAll],
  );

  function transactionReceipts(txn: RPCTransactionInfo) {
    const receiptsMap =
      txn?.receipts_outcome &&
      txn?.receipts_outcome.reduce((mapping, receiptOutcome) => {
        const receipt = parseReceipt
          ? parseReceipt(
              txn.receipts.find(
                (rpcReceipt) => rpcReceipt.receipt_id === receiptOutcome.id,
              ),
              receiptOutcome,
              txn.transaction,
            )
          : '';
        return mapping.set(receiptOutcome.id, {
          ...receipt,
          outcome: parseOutcomeOld ? parseOutcomeOld(receiptOutcome) : '',
        });
      }, new Map());

    const receipts = collectNestedReceiptWithOutcomeOld
      ? collectNestedReceiptWithOutcomeOld(
          txn.transaction_outcome.outcome.receipt_ids[0],
          receiptsMap,
        )
      : '';

    return receipts;
  }

  useEffect(() => {
    if (rpcTxn) {
      const receipt = transactionReceipts(rpcTxn);
      setReceipt(receipt);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn, receipt?.block_hash, config.backendUrl]);

  const txnsPending = txn?.outcomes?.status === null;
  return (
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
        <div className="flex flex-col w-full mx-auto divide-y dark:divide-black-200">
          <div className="flex justify-end w-full p-4 items-center">
            <div
              className="cursor-pointer mx-1 flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-1 border border-neargray-700 dark:border-black-200 px-2 rounded-md bg-whit select-none"
              onClick={expandAllReceipts}
            >
              <span>
                <span className="mr-1.5">
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </span>
                {expandAll ? '-' : '+'}
              </span>
            </div>
          </div>
          <div className="p-4 md:px-8 overflow-auto">
            {!receipt?.id ? (
              <div>
                <div className="flex flex-row mb-2.5">
                  <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                  <div className="text-green-500 dark:text-green-250 text-sm">
                    <Skeleton className="w-40 h-4" />
                  </div>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border-green-500 dark:border-green-250"
                  >
                    <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
                      <Skeleton className="w-25 h-8" />
                    </div>
                    <div className="relative flex flex-row my-2.5">
                      <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                      <div className="text-green-500 dark:text-green-250 text-sm ">
                        <Skeleton className="w-40 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Widget
                src={`${ownerId}/widget/bos-components.components.Transactions.TransactionReceipt`}
                props={{
                  network: network,
                  t: t,
                  receipt: receipt,
                  expandAll: expandAll,
                  fellowOutgoingReceipts: [],
                  convertionReceipt: true,
                  className: '',
                  ownerId,
                }}
                loading={
                  <div>
                    <div className="flex flex-row mb-2.5">
                      <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                      <div className="text-green-500 dark:text-green-250 text-sm">
                        <Skeleton className="w-40 h-4" />
                      </div>
                    </div>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="border-green-500 dark:border-green-250"
                      >
                        <div className="flex flex-col relative border-l border-green-500 dark:border-green-250 py-2 pl-6 ml-2.5">
                          <Skeleton className="w-25 h-8" />
                        </div>
                        <div className="relative flex flex-row my-2.5">
                          <div className="bg-gray-200 dark:bg-black-200 h-5 w-5 rounded-full mr-3"></div>
                          <div className="text-green-500 dark:text-green-250 text-sm ">
                            <Skeleton className="w-40 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
