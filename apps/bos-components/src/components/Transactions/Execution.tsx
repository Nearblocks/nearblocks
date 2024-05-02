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

  const FaHourglassStart = (props: any) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}>
        <path
          d="M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64V75c0 42.4 16.9 83.1 46.9 113.1L146.7 256 78.9 323.9C48.9 353.9 32 394.6 32 437v11c-17.7 0-32 14.3-32 32s14.3 32 32 32H64 320h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V437c0-42.4-16.9-83.1-46.9-113.1L237.3 256l67.9-67.9c30-30 46.9-70.7 46.9-113.1V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320 64 32zM288 437v11H96V437c0-25.5 10.1-49.9 28.1-67.9L192 301.3l67.9 67.9c18 18 28.1 42.4 28.1 67.9z"
          fill="#FFEB3B"
        />
      </svg>
    );
  };
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

  const Loader = (props: { className?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };
  const txnsPending = txn?.outcomes?.status === null;
  return (
    <div className="text-sm text-nearblue-600 dark:text-neargray-10 dark:divide-black-200  divide-solid divide-gray-200 divide-y">
      {txnsPending ? (
        <div className="flex justify-center text-base p-24">
          <div className="text-center">
            <div className="inline-flex items-center text-base rounded bg-yellow-50 dark:bg-black-200 text-yellow-500 animate-spin my-3">
              <FaHourglassStart className="w-4" />
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
              Expand All <span className="ml-1.5">+</span>
            </div>
          </div>
          <div className="p-4 md:px-8 overflow-auto">
            {!receipt?.id ? (
              <div className="w-full md:w-3/4">
                <Loader className="flex w-full mt-2" />
                <Loader className="flex w-full mt-2" />
                <Loader className="flex w-full mt-2" />
                <Loader className="flex w-full mt-2" />
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
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
