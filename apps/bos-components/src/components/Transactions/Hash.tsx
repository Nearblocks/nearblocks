/**
 * Component: TransactionsHash
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transaction Hash on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [hash] -  The Transaction identifier passed as a string.
 * @param {function} [onHandleTab] - Function to handle tab changes. (Optional)
 *                                    Example: onTab={onHandleTab} where onHandleTab is a function to change tab on the page.
 * @param {string} [pageTab] - The page tab being displayed. (Optional)
 *                                 Example: If provided, tab=overview in the url it will select the overview tab of transaction details.
 * @param {string} ownerID - The identifier of the owner of the component.
 */

interface Props {
  ownerID: string;
  network: string;
  t: (key: string) => string | undefined;
  hash: string;
  onHandleTab: (value: string) => void;
  pageTab: string;
}

import Skeleton from '@/includes/Common/Skeleton';
import ArrowDown from '@/includes/icons/ArrowDown';
import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';

const hashes = ['overview', 'execution', 'comments'];

export default function (props: Props) {
  const { t, network, hash, onHandleTab, pageTab, ownerID } = props;

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerID}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [txn, setTxn] = useState<TransactionInfo | null>(null);
  const [error, setError] = useState(false);
  const [isToggle, setIsToggle] = useState(false);
  const [rpcTxn, setRpcTxn] = useState<RPCTransactionInfo>(
    {} as RPCTransactionInfo,
  );

  const config = getConfig && getConfig(network);

  const onTab = (index: number) => {
    onHandleTab(hashes[index]);
  };

  useEffect(() => {
    function fetchTxn() {
      setIsLoading(true);
      asyncFetch(`${config.backendUrl}txns/${hash}`)
        .then(
          (data: {
            body: {
              txns: TransactionInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTxn(resp);
              setIsLoading(false);
            } else {
              handleRateLimit(data, fetchTxn, () => setIsLoading(false));
            }
          },
        )
        .catch((error: Error) => {
          if (error) setError(true);
          setIsLoading(false);
        });
    }

    fetchTxn();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.backendUrl, hash]);

  useEffect(() => {
    function fetchTransactionStatus() {
      if (txn) {
        asyncFetch(config?.rpcUrl, {
          method: 'POST',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 123,
            method: 'EXPERIMENTAL_tx_status',
            params: [txn.transaction_hash, txn.signer_account_id],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(
            (res: {
              body: {
                result: RPCTransactionInfo;
              };
              status: number;
            }) => {
              const resp = res?.body?.result;
              if (res.status === 200) {
                setRpcTxn(resp);
              } else {
                handleRateLimit(res, fetchTransactionStatus);
              }
            },
          )
          .catch(() => {});
      }
    }

    fetchTransactionStatus();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, config?.rpcUrl]);

  return (
    <>
      <div>
        <div className="md:flex items-center justify-between">
          {isLoading ? (
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>
          ) : (
            <h1 className="text-xl text-nearblue-600 px-2 py-5">
              {t ? t('txns:txn.heading') : 'Transaction Details'}
            </h1>
          )}
        </div>
      </div>
      {error || (!isLoading && !txn) ? (
        <div className="text-nearblue-700 text-xs px-2 mb-4">
          {t ? t('txns:txnError') : 'Transaction Error'}
        </div>
      ) : (
        <>
          <div>
            {hashes &&
              hashes.map((hash, index) => (
                <button
                  key={index}
                  onClick={() => onTab(index)}
                  className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                    pageTab === hash
                      ? 'rounded-lg bg-green-600 text-white'
                      : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600'
                  }`}
                  value={hash}
                >
                  {hash === 'overview' ? (
                    <h2>{t ? t('txns:txn.tabs.overview') : 'Overview'}</h2>
                  ) : hash === 'execution' ? (
                    pageTab !== 'execution' ? (
                      <>
                        <h2>
                          {isToggle
                            ? 'Enhanced Plan'
                            : t
                            ? t('txns:txn.tabs.execution')
                            : 'Execution Plan'}
                        </h2>
                      </>
                    ) : (
                      <Popover.Root key={isToggle}>
                        <Popover.Trigger asChild>
                          <button
                            className="flex border border-green-900/10 text-xs  rounded focus:outline-none"
                            aria-label="Update dimensions"
                          >
                            {isToggle
                              ? 'Enhanced Plan'
                              : t
                              ? t('txns:txn.tabs.execution')
                              : 'Execution Plan'}
                            <ArrowDown className="h-4 w-4 fill-current ml-1" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Content
                          className="bg-white w-60 shadow-lg border rounded-lg slide-down mt-4"
                          sideOffset={5}
                        >
                          <ul className="divide-y">
                            <li
                              onClick={() => setIsToggle(false)}
                              className={`py-2 text-nearblue-600 ${
                                !isToggle ? 'bg-gray-300' : ''
                              }`}
                            >
                              {t('txns:txn.tabs.execution') || 'Execution Plan'}
                            </li>
                            <li
                              onClick={() => setIsToggle(true)}
                              className={`py-2 text-nearblue-600 ${
                                isToggle ? 'bg-gray-300' : ''
                              }`}
                            >
                              Enhanced Plan
                            </li>
                          </ul>
                        </Popover.Content>
                      </Popover.Root>
                    )
                  ) : (
                    <h2>{t ? t('txns:txn.tabs.comments') : 'Comments'}</h2>
                  )}
                </button>
              ))}
          </div>
          <div className="bg-white soft-shadow rounded-xl pb-1">
            <div className={`${pageTab === 'overview' ? '' : 'hidden'} `}>
              {
                <Widget
                  src={`${ownerID}/widget/bos-components.components.Transactions.Detail`}
                  props={{
                    txn: txn,
                    rpcTxn: rpcTxn,
                    loading: isLoading,
                    network: network,
                    t: t,
                    ownerID,
                  }}
                />
              }
            </div>
            <div className={`${pageTab === 'execution' ? '' : 'hidden'} `}>
              <div className={`${isToggle ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerID}/widget/bos-components.components.Transactions.Execution`}
                    props={{
                      network: network,
                      t: t,
                      txn: txn,
                      rpcTxn: rpcTxn,
                      loading: isLoading,
                      ownerID,
                    }}
                  />
                }
              </div>
              <div className={`${isToggle ? 'hidden' : ''} `}>
                <Widget
                  src={`${ownerID}/widget/bos-components.components.Transactions.Receipt`}
                  props={{
                    network: network,
                    t: t,
                    txn: txn,
                    rpcTxn: rpcTxn,
                    loading: isLoading,
                    ownerID,
                  }}
                />
              </div>
            </div>
            <div className={`${pageTab === 'comments' ? '' : 'hidden'} `}>
              <div className="py-3">
                {
                  <Widget
                    src={`${ownerID}/widget/bos-components.components.Comments.Feed`}
                    props={{
                      network: network,
                      path: `nearblocks.io/txns/${hash}`,
                      limit: 10,
                      ownerID,
                    }}
                  />
                }
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
