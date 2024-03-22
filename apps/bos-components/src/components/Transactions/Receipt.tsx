/**
 * Component: TransactionsReceipt
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {TransactionInfo} [txn] - Information related to a transaction.
 * @param {RPCTransactionInfo} [rpcTxn] - RPC data of the transaction.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  txn: TransactionInfo;
  rpcTxn: RPCTransactionInfo;
}

import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';

export default function (props: Props) {
  const networkAccountId =
    context.networkId === 'mainnet' ? 'nearblocks.near' : 'nearblocks.testnet';

  const { getConfig } = VM.require(
    `${networkAccountId}/widget/includes.Utils.libs`,
  );

  const { mapRpcActionToAction } = VM.require(
    `${networkAccountId}/widget/includes.Utils.near`,
  );
  const { network, rpcTxn, txn, t } = props;
  const [receipt, setReceipt] = useState(null);

  const config = getConfig && getConfig(network);

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

  return (
    <div className="bg-white text-sm text-nearblue-600 divide-solid divide-gray-200 divide-y">
      {
        <Widget
          src={`${config?.ownerId}/widget/bos-components.components.Transactions.ReceiptRow`}
          props={{
            txn: txn,
            receipt: receipt,
            network: network,
            t: t,
          }}
        />
      }
    </div>
  );
}
