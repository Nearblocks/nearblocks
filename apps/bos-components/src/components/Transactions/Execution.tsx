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
 * @param {string} ownerID - The identifier of the owner of the component.
 */

interface Props {
  ownerID: string;
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
  const { network, rpcTxn, t, ownerID } = props;

  const { collectNestedReceiptWithOutcomeOld, parseOutcomeOld, parseReceipt } =
    VM.require(`${ownerID}/widget/includes.Utils.near`);

  const { getConfig } = VM.require(`${ownerID}/widget/includes.Utils.libs`);

  const [receipt, setReceipt] = useState<
    NestedReceiptWithOutcome | FailedToFindReceipt | any
  >(null);

  const config = getConfig && getConfig(network);

  const [expandAll, setExpandAll] = useState(false);
  const expandAllReceipts = useCallback(
    () => setExpandAll((x) => !x),
    [setExpandAll],
  );

  function transactionReceipts(txn: RPCTransactionInfo) {
    const receiptsMap =
      txn?.receipts_outcome &&
      txn?.receipts_outcome.reduce((mapping, receiptOutcome) => {
        const receipt = parseReceipt(
          txn.receipts.find(
            (rpcReceipt) => rpcReceipt.receipt_id === receiptOutcome.id,
          ),
          receiptOutcome,
          txn.transaction,
        );
        return mapping.set(receiptOutcome.id, {
          ...receipt,
          outcome: parseOutcomeOld(receiptOutcome),
        });
      }, new Map());

    const receipts = collectNestedReceiptWithOutcomeOld(
      txn.transaction_outcome.outcome.receipt_ids[0],
      receiptsMap,
    );

    return receipts;
  }

  useEffect(() => {
    if (rpcTxn) {
      const receipt = transactionReceipts(rpcTxn);
      setReceipt(receipt);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn, receipt?.block_hash, config.backendUrl]);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  return (
    <div className="text-sm text-nearblue-600 divide-solid divide-gray-200 divide-y">
      <div className="flex flex-col w-full mx-auto divide-y">
        <div className="flex justify-end w-full p-4 items-center">
          <div
            className="cursor-pointer mx-1 flex items-center text-nearblue-600 font-medium py-1 border border-neargray-700 px-2 rounded-md bg-whit select-none"
            onClick={expandAllReceipts}
          >
            Expand all <span>+</span>
          </div>
        </div>
        <div className="p-8">
          {!receipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full my-1 max-w-xs" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          ) : (
            <Widget
              src={`${ownerID}/widget/bos-components.components.Transactions.TransactionReceipt`}
              props={{
                network: network,
                t: t,
                receipt: receipt,
                expandAll: expandAll,
                fellowOutgoingReceipts: [],
                convertionReceipt: true,
                className: '',
                ownerID,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
