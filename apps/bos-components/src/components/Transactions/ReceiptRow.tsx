/**
 * Component: TransactionsReceiptRow
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of Transaction Receipt Row on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {TransactionInfo} [txn] - Information related to a transaction.
 * @param {RPCTransactionInfo} [rpcTxn] - RPC data of the transaction.
 * @param {ReceiptsPropsInfo} [receipt] -  receipt of the transaction.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  txn?: TransactionInfo;
  receipt: ReceiptsPropsInfo;
  borderFlag?: boolean;
}

import {
  BlocksInfo,
  ReceiptsPropsInfo,
  TransactionInfo,
} from '@/includes/types';
import Question from '@/includes/Common/Question';
import ReceiptStatus from '@/includes/Common/Receipts/ReceiptStatus';
import TransactionActions from '@/includes/Common/Receipts/TransactionActions';

export default function (props: Props) {
  const { network, receipt, borderFlag, t, ownerId } = props;

  const { convertToMetricPrefix, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, yoctoToNear } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [block, setBlock] = useState<BlocksInfo>({} as BlocksInfo);
  const [loading, setLoading] = useState(false);

  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchBlocks() {
      setLoading(true);
      if (receipt?.block_hash) {
        asyncFetch(`${config.backendUrl}blocks/${receipt?.block_hash}`)
          .then(
            (res: {
              body: {
                blocks: BlocksInfo[];
              };
              status: number;
            }) => {
              const resp = res?.body?.blocks?.[0];
              if (res.status === 200) {
                setBlock({
                  author_account_id: resp.author_account_id,
                  block_hash: resp.author_account_id,
                  block_height: resp.block_height,
                  block_timestamp: resp.block_timestamp,
                  chunks_agg: resp.chunks_agg,
                  gas_price: resp.gas_price,
                  prev_block_hash: resp.author_account_id,
                  receipts_agg: resp.receipts_agg,
                  transactions_agg: resp.transactions_agg,
                });
                setLoading(false);
              } else {
                handleRateLimit(res, fetchBlocks, () => setLoading(false));
              }
            },
          )
          .catch(() => {});
      }
    }
    if (config?.backendUrl) {
      fetchBlocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.block_hash, config.backendUrl]);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  return (
    <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
      <div
        className={
          borderFlag
            ? ''
            : 'border-l-4 border-green-400 dark:border-green-250 ml-8 my-2'
        }
      >
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  {t
                    ? t('txns:txn.receipts.receipt.tooltip')
                    : 'Unique identifier (hash) of this receipt.'}
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            {t ? t('txns:txn.receipts.receipt.text.0') : 'Receipt'}
          </div>
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 font-semibold word-break">
              {receipt?.receipt_id ? receipt?.receipt_id : ''}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  Block height
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            {t ? t('txns:txn.receipts.block.text.0') : 'Block'}
          </div>
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          ) : block?.block_height ? (
            <div className="w-full md:w-3/4 word-break">
              <Link
                href={`/blocks/${receipt.block_hash}`}
                className="hover:no-underline"
              >
                <a className="text-green-500 dark:text-green-250 hover:no-underline">
                  {localFormat(block?.block_height)}
                </a>
              </Link>
            </div>
          ) : (
            ''
          )}
        </div>
        <div>
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <OverlayTrigger
                placement="bottom-start"
                delay={{ show: 500, hide: 0 }}
                overlay={
                  <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                    {t
                      ? t('txns:txn.receipts.from.tooltip')
                      : 'The account which issued a receipt.'}
                  </Tooltip>
                }
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </OverlayTrigger>
              {t ? t('txns:txn.receipts.from.text.0') : 'From'}
            </div>
            {!receipt || loading ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-full max-w-sm" />
              </div>
            ) : receipt?.predecessor_id ? (
              <div className="w-full md:w-3/4 word-break">
                <Link
                  href={`/address/${receipt?.predecessor_id}`}
                  className="hover:no-underline"
                >
                  <a className="text-green-500 dark:text-green-250 hover:no-underline">
                    {receipt?.predecessor_id}
                  </a>
                </Link>
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <OverlayTrigger
                placement="bottom-start"
                delay={{ show: 500, hide: 0 }}
                overlay={
                  <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                    {t
                      ? t('txns:txn.receipts.to.tooltip')
                      : 'The destination account of the receipt.'}
                  </Tooltip>
                }
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </OverlayTrigger>
              {t ? t('txns:txn.receipts.to.text.0') : 'To'}
            </div>
            {!receipt || loading ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-full max-w-xs" />
              </div>
            ) : receipt?.receiver_id ? (
              <div className="w-full md:w-3/4 word-break">
                <Link
                  href={`/address/${receipt?.receiver_id}`}
                  className="hover:no-underline"
                >
                  <a className="text-green-500 dark:text-green-250 hover:no-underline">
                    {receipt?.receiver_id}
                  </a>
                </Link>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  {t
                    ? t('txns:txn.receipts.burnt.tooltip')
                    : 'Total amount of Gas & Token burnt from this receipt.'}
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            {t
              ? t('txns:txn.receipts.burnt.text.0')
              : 'Burnt Gas & Tokens by Receipt'}
          </div>
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-36" />
            </div>
          ) : receipt?.outcome?.gas_burnt ? (
            <div className="w-full items-center text-xs flex md:w-3/4 break-words">
              <div className="bg-orange-50  dark:bg-black-200 rounded-md px-2 py-1">
                <span className="text-xs mr-2">🔥 </span>
                {receipt?.outcome?.gas_burnt
                  ? convertToMetricPrefix(receipt?.outcome?.gas_burnt) + 'gas'
                  : ''}
                <span className="text-gray-300 px-1">|</span>{' '}
                {receipt?.outcome?.tokens_burnt
                  ? yoctoToNear(receipt?.outcome?.tokens_burnt, true)
                  : ''}{' '}
                Ⓝ
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex items-start flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  {t
                    ? t('txns:txn.receipts.actions.tooltip')
                    : 'The actions performed during receipt processing.'}
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            {t ? t('txns:txn.receipts.actions.text.0') : 'Actions'}
          </div>
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full my-1 max-w-xs" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          ) : receipt?.actions ? (
            <div className="w-full md:w-3/4 word-break space-y-4">
              {receipt &&
                receipt?.actions?.map((action: any, i: number) => (
                  <TransactionActions
                    key={i}
                    action={action}
                    receiver={receipt?.receiver_id}
                    t={t}
                    ownerId={ownerId}
                    network={network}
                  />
                ))}
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex items-start flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  {t
                    ? t('txns:txn.receipts.result.tooltip')
                    : 'The result of the receipt execution.'}
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            {t ? t('txns:txn.receipts.result.text.0') : 'Result'}
          </div>
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {receipt ? <ReceiptStatus receipt={receipt} /> : ''}
            </div>
          )}
        </div>
        <div className="flex items-start flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <OverlayTrigger
              placement="bottom-start"
              delay={{ show: 500, hide: 0 }}
              overlay={
                <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                  {t
                    ? t('txns:txn.receipts.logs.tooltip')
                    : 'Logs included in the receipt.'}
                </Tooltip>
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </OverlayTrigger>
            {t ? t('txns:txn.receipts.logs.text.0') : 'Logs'}
          </div>
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {receipt?.outcome?.logs?.length > 0 ? (
                <textarea
                  readOnly
                  rows={4}
                  defaultValue={receipt?.outcome?.logs?.join('\n')}
                  className="block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y"
                ></textarea>
              ) : (
                'No Logs'
              )}
            </div>
          )}
        </div>
      </div>
      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <div className="pb-4">
          {receipt?.outcome?.outgoing_receipts?.map((rcpt: any) => (
            <div className="pl-4 pt-6" key={rcpt?.receipt_id}>
              <div className="mx-4 border-l-4 border-l-gray-200">
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptRow`}
                    props={{
                      receipt: rcpt,
                      borderFlag: true,
                      network: network,
                      Link,
                      ownerId,
                      t,
                    }}
                  />
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
