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
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  hash: string;
  onHandleTab: (value: string) => void;
  pageTab: string;
}

import ErrorMessage from '@/includes/Common/ErrorMessage';
import ArrowDown from '@/includes/icons/ArrowDown';
import FileSlash from '@/includes/icons/FileSlash';
import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';

const hashes = ['overview', 'execution', 'comments'];

export default function (props: Props) {
  const { t, network, hash, onHandleTab, pageTab, ownerId } = props;

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(true);
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
              setError(false);
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
    if (config.backendUrl) {
      fetchTxn();
    }

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
    if (config?.rpcUrl) {
      fetchTransactionStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, config?.rpcUrl]);

  return (
    <>
      {error || (!isLoading && !txn) ? (
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 divide-y">
            <ErrorMessage
              icons={<FileSlash />}
              message="Sorry, We are unable to locate this TxnHash"
              mutedText={hash}
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            {hashes &&
              hashes.map((hash, index) => (
                <button
                  key={index}
                  onClick={() => onTab(index)}
                  className={`text-nearblue-600  text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer mb-3 mr-3 focus:outline-none ${
                    pageTab === hash
                      ? 'rounded-lg bg-green-600 dark:bg-green-250 dark:text-black text-white'
                      : 'hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200  rounded-lg hover:text-nearblue-600'
                  }`}
                  value={hash}
                >
                  {hash === 'overview' ? (
                    <h2 className="p-2">
                      {t ? t('txns:txn.tabs.overview') : 'Overview'}
                    </h2>
                  ) : hash === 'execution' ? (
                    pageTab !== 'execution' ? (
                      <div className="p-2">
                        <h2 className="flex">
                          {isToggle
                            ? 'Enhanced Plan'
                            : t
                            ? t('txns:txn.tabs.execution')
                            : 'Execution Plan'}
                          <ArrowDown className="h-4 w-4 fill-current ml-1" />
                        </h2>
                        <div className="absolute text-white bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-7 px-1 ">
                          NEW
                        </div>
                      </div>
                    ) : (
                      <Popover.Root key={isToggle}>
                        <Popover.Trigger asChild>
                          <button
                            className="flex p-2 text-xs  rounded focus:outline-none"
                            aria-label="Update dimensions"
                          >
                            {isToggle
                              ? 'Enhanced Plan'
                              : t
                              ? t('txns:txn.tabs.execution')
                              : 'Execution Plan'}
                            <ArrowDown className="h-4 w-4 fill-current ml-1" />
                            <div className="absolute text-white bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-24 -mt-3 px-1 ">
                              NEW
                            </div>{' '}
                          </button>
                        </Popover.Trigger>
                        <Popover.Content
                          className="bg-white dark:bg-black-600 dark:border-black-200 w-48 shadow-lg border rounded-lg slide-down mt-2 z-50"
                          sideOffset={5}
                        >
                          <ul className="divide-y dark:divide-black-200">
                            <li
                              onClick={() => setIsToggle(false)}
                              className={`py-2 text-nearblue-600 dark:text-neargray-10 rounded-t-lg ${
                                !isToggle ? 'bg-gray-300 dark:bg-black-200' : ''
                              }`}
                            >
                              {t('txns:txn.tabs.execution') || 'Execution Plan'}
                            </li>
                            <li
                              onClick={() => setIsToggle(true)}
                              className={`py-2 text-nearblue-600 dark:text-neargray-10 rounded-b-lg ${
                                isToggle ? 'bg-gray-300 dark:bg-black-200' : ''
                              }`}
                            >
                              Enhanced Plan
                            </li>
                          </ul>
                        </Popover.Content>
                      </Popover.Root>
                    )
                  ) : (
                    <h2 className="p-2">
                      {t ? t('txns:txn.tabs.comments') : 'Comments'}
                    </h2>
                  )}
                </button>
              ))}
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            <div className={`${pageTab === 'overview' ? '' : 'hidden'} `}>
              {
                <Widget
                  src={`${ownerId}/widget/bos-components.components.Transactions.Detail`}
                  props={{
                    txn: txn,
                    rpcTxn: rpcTxn,
                    loading: isLoading,
                    network: network,
                    t: t,
                    ownerId,
                  }}
                />
              }
            </div>
            <div className={`${pageTab === 'execution' ? '' : 'hidden'} `}>
              <div className={`${isToggle ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Transactions.Execution`}
                    props={{
                      network: network,
                      t: t,
                      txn: txn,
                      rpcTxn: rpcTxn,
                      loading: isLoading,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${isToggle ? 'hidden' : ''} `}>
                <Widget
                  src={`${ownerId}/widget/bos-components.components.Transactions.Receipt`}
                  props={{
                    network: network,
                    t: t,
                    txn: txn,
                    rpcTxn: rpcTxn,
                    loading: isLoading,
                    ownerId,
                  }}
                />
              </div>
            </div>
            <div className={`${pageTab === 'comments' ? '' : 'hidden'} `}>
              <div className="py-3">
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Comments.Feed`}
                    props={{
                      network: network,
                      path: `nearblocks.io/txns/${hash}`,
                      limit: 10,
                      ownerId,
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
