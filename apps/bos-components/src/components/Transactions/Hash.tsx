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
 * @param {Function} [requestSignInWithWallet] - Function to initiate sign-in with a wallet.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  requestSignInWithWallet: () => void;
  hash: string;
  onHandleTab: (value: string) => void;
  pageTab: string;
}
import ErrorMessage from '@/includes/Common/ErrorMessage';
import FileSlash from '@/includes/icons/FileSlash';
import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';

export default function TransactionsHash(props: Props) {
  const {
    t,
    network,
    hash,
    onHandleTab,
    pageTab,
    ownerId,
    requestSignInWithWallet,
  } = props;

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [txn, setTxn] = useState<TransactionInfo | null>(null);
  const [error, setError] = useState(false);
  const [rpcTxn, setRpcTxn] = useState<RPCTransactionInfo>(
    {} as RPCTransactionInfo,
  );

  const config = getConfig && getConfig(network);
  const [loadedTabs, setLoadedTabs] = useState<string[]>([pageTab]);

  const onTab = (hash: string) => {
    onHandleTab(hash);
    if (!loadedTabs.includes(hash)) {
      setLoadedTabs([...loadedTabs, hash]);
    }
  };
  console.log(loadedTabs);
  useEffect(() => {
    let delay = 1000;
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
              if (resp?.outcomes?.status === null) {
                setTimeout(fetchTxn, delay);
                delay = 15000;
              }
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

  const buttonStyles = (hash: string) =>
    `relative text-nearblue-600  text-xs leading-4 font-medium inline-block cursor-pointer mb-3 mr-3 focus:outline-none ${
      pageTab === hash
        ? 'rounded-lg bg-green-600 dark:bg-green-250 text-white'
        : 'hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200  rounded-lg hover:text-nearblue-600'
    }`;

  return (
    <Fragment key="hash">
      {error || (!isLoading && !txn) ? (
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
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
            <button
              onClick={() => onTab('overview')}
              className={buttonStyles('overview')}
            >
              <h2 className="p-2">
                {t ? t('txns:txn.tabs.overview') : 'Overview'}
              </h2>
            </button>
            <button
              onClick={() => onTab('execution')}
              className={buttonStyles('execution')}
            >
              <h2 className="p-2">
                {t ? t('txns:txn.tabs.execution') : 'Execution Plan'}
              </h2>
            </button>
            <button
              onClick={() => onTab('enhanced')}
              className={buttonStyles('enhanced')}
            >
              <h2 className="p-2">{'Enhanced Plan'}</h2>
              <div className="absolute text-white bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md -top-1.5 -right-1.5 px-1">
                NEW
              </div>
            </button>
            <button
              onClick={() => onTab('tree')}
              className={buttonStyles('tree')}
            >
              <h2 className="p-2">Tree Plan</h2>
            </button>
            <button
              onClick={() => onTab('summary')}
              className={buttonStyles('summary')}
            >
              <h2 className="p-2">Receipt Summary</h2>
            </button>
            <button
              onClick={() => onTab('comments')}
              className={buttonStyles('comments')}
            >
              <h2 className="p-2">
                {t ? t('txns:txn.tabs.comments') : 'Comments'}
              </h2>
            </button>
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            {loadedTabs.includes('overview') && (
              <div className={`${pageTab === 'overview' ? '' : 'hidden'} `}>
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
              </div>
            )}
            {loadedTabs.includes('execution') && (
              <div className={`${pageTab === 'execution' ? '' : 'hidden'} `}>
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
            )}
            {loadedTabs.includes('enhanced') && (
              <div className={`${pageTab === 'enhanced' ? '' : 'hidden'} `}>
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
              </div>
            )}
            {loadedTabs.includes('tree') && (
              <div className={`${pageTab === 'tree' ? '' : 'hidden'} `}>
                <Widget
                  src={`${ownerId}/widget/bos-components.components.Transactions.Tree`}
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
            )}
            {loadedTabs.includes('summary') && (
              <div className={`${pageTab === 'summary' ? '' : 'hidden'} `}>
                <Widget
                  src={`${ownerId}/widget/bos-components.components.Transactions.ReceiptSummary`}
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
            )}
            {loadedTabs.includes('comments') && (
              <div className={`${pageTab === 'comments' ? '' : 'hidden'} `}>
                <div className="py-3">
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Comments.Feed`}
                    props={{
                      network: network,
                      path: `nearblocks.io/txns/${hash}`,
                      limit: 10,
                      ownerId,
                      requestSignInWithWallet,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Fragment>
  );
}
