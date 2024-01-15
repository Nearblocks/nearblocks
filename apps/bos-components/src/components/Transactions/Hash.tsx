/**
 * Component: TransactionsHash
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transaction Hash on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [hash] -  The Transaction identifier passed as a string.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  hash: string;
}

import { getConfig } from '@/includes/libs';
import { TransactionInfo, RPCTransactionInfo } from '@/includes/types';

const hashes = [' ', 'execution', 'comments'];

export default function (props: Props) {
  const { t, network, hash } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [txn, setTxn] = useState<TransactionInfo>({} as TransactionInfo);
  const [error, setError] = useState(false);
  const [rpcTxn, setRpcTxn] = useState<RPCTransactionInfo>(
    {} as RPCTransactionInfo,
  );
  const [pageHash, setHash] = useState(' ');

  const config = getConfig(network);

  const onTab = (index: number) => {
    setHash(hashes[index]);
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
            }
            setIsLoading(false);
          },
        )
        .catch((error: Error) => {
          if (error) setError(true);
          setIsLoading(false);
        });
    }

    fetchTxn();
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
              }
            },
          )
          .catch(() => {});
      }
    }

    fetchTransactionStatus();
  }, [txn, hash, config?.rpcUrl]);

  return (
    <>
      <div>
        <div className="md:flex items-center justify-between">
          <h1 className="text-xl text-gray-700 px-2 py-4">
            {t ? t('txns:txn.heading') : 'Transaction Details'}
          </h1>
          {
            <Widget
              src={`${config.ownerId}/widget/bos-components.components.Shared.SponsoredBox`}
            />
          }
        </div>
        <div className="text-gray-500 px-2 pb-5 pt-1 border-t"></div>
      </div>
      {error || (!isLoading && !txn) ? (
        <div className="text-gray-400 text-xs px-2 mb-4">
          {t ? t('txns:txnError') : 'Transaction Error'}
        </div>
      ) : (
        <div className="bg-white soft-shadow rounded-lg pb-1">
          <Tabs.Root defaultValue={pageHash}>
            <Tabs.List className={'flex flex-wrap border-b'}>
              {hashes &&
                hashes.map((hash, index) => (
                  <Tabs.Trigger
                    key={index}
                    onClick={() => onTab(index)}
                    className={`text-gray-600 text-sm font-semibold border-green-500 overflow-hidden inline-block cursor-pointer p-3 focus:outline-none hover:text-green-500 ${
                      pageHash === hash ? 'border-b-4 border-green-500' : ''
                    }`}
                    value={hash}
                  >
                    {hash === ' ' ? (
                      <h2>{t ? t('txns:txn.tabs.overview') : 'Overview'}</h2>
                    ) : hash === 'execution' ? (
                      <h2>
                        {t ? t('txns:txn.tabs.execution') : 'Execution Plan'}
                      </h2>
                    ) : (
                      <h2>{t ? t('txns:txn.tabs.comments') : 'Comments'}</h2>
                    )}
                  </Tabs.Trigger>
                ))}
            </Tabs.List>
            <Tabs.Content value={hashes[0]}>
              {
                <Widget
                  src={`${config.ownerId}/widget/bos-components.components.Transactions.Detail`}
                  props={{
                    txn: txn,
                    rpcTxn: rpcTxn,
                    loading: isLoading,
                    network: network,
                    t: t,
                  }}
                />
              }
            </Tabs.Content>
            <Tabs.Content value={hashes[1]}>
              {
                <Widget
                  src={`${config.ownerId}/widget/bos-components.components.Transactions.Receipt`}
                  props={{
                    txn: txn,
                    rpcTxn: rpcTxn,
                    loading: isLoading,
                    network: network,
                    t: t,
                  }}
                />
              }
            </Tabs.Content>
            <Tabs.Content value={hashes[2]}>
              <div className="px-4 sm:px-6 py-3"></div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      )}
    </>
  );
}
