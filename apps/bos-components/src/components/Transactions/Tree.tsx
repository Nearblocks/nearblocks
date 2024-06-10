/**
 * Component: TransactionsTree
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
import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';
export default function (props: Props) {
  const { network, rpcTxn, txn, t, ownerId } = props;

  const { mapRpcActionToAction } = VM.require(
    `${ownerId}/widget/includes.Utils.near`,
  );
  const [receipt, setReceipt] = useState<any>(null);
  const [show, setShow] = useState<any>(null);
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
      setShow(receipt?.receipt_id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn]);

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
        <div className="w-full mx-auto">
          <div className="p-4 md:px-8">
            {!receipt?.id ? (
              <div className="md:flex justify-center w-full lg:!h-[36vh]">
                <div className="w-full md:w-7/12 lg:w-2/3 xl:w-3/4 ">
                  <div className="py-2">
                    <Skeleton className="w-full h-80" />{' '}
                  </div>
                </div>
                <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4">
                  <div className="text-green-500 dark:text-green-250 text-xl pt-3 pl-3">
                    Receipt
                  </div>
                  <div className="w-full pl-3 py-2 flex items-center">
                    Predecessor: <Skeleton className="w-full h-4" />{' '}
                  </div>
                  <div className="w-full pl-3 py-2 flex items-center">
                    Receiver: <Skeleton className="w-full h-4" />{' '}
                  </div>
                  <div className="w-full pl-3 word-break space-y-4">
                    <Skeleton className="w-full h-10" />{' '}
                  </div>

                  <div className="text-green-500 dark:text-green-250 text-xl pt-3 pl-3">
                    Execution Outcomes
                  </div>
                  <div className="pl-3 py-2">
                    <span className="text-base">Logs:</span>

                    <div className="w-full break-words space-y-4">
                      <Skeleton className="w-full h-4" />{' '}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:flex justify-center ">
                <div className="w-full md:w-7/12 lg:w-2/3 xl:w-3/4 overflow-auto">
                  <ul className="hierarchy-tree">
                    <li>
                      <Widget
                        src={`${ownerId}/widget/bos-components.components.Transactions.TreeReceipt`}
                        props={{
                          txn: txn,
                          receipt: receipt,
                          network: network,
                          t: t,
                          ownerId,
                          setShow,
                          show,
                        }}
                      />
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4">
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Transactions.TreeReceiptDetails`}
                    props={{
                      txn: txn,
                      receipt: receipt,
                      network: network,
                      t: t,
                      ownerId,
                      show,
                    }}
                    loading={
                      <>
                        <div className="text-green-500 dark:text-green-250 text-xl pt-3 pl-3">
                          Receipt
                        </div>
                        <div className="w-full pl-3 py-2 flex items-center">
                          Predecessor: <Skeleton className="w-full h-4" />{' '}
                        </div>
                        <div className="w-full pl-3 py-2 flex items-center">
                          Receiver: <Skeleton className="w-full h-4" />{' '}
                        </div>
                        <div className="w-full pl-3 word-break space-y-4">
                          <Skeleton className="w-full h-10" />{' '}
                        </div>

                        <div className="text-green-500 dark:text-green-250 text-xl pt-3 pl-3">
                          Execution Outcomes
                        </div>
                        <div className="pl-3 py-2">
                          <span className="text-base">Logs:</span>

                          <div className="w-full break-words space-y-4">
                            <Skeleton className="w-full h-4" />{' '}
                          </div>
                        </div>
                      </>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
