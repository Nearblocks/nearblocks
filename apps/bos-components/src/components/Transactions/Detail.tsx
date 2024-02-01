/**
 * Component: TransactionsDetail
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Details of specific Transaction on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {boolean} [loading] - Indicates whether data is currently loading.
 * @param {TransactionInfo} [txn] - Information related to a transaction.
 * @param {RPCTransactionInfo} [rpcTxn] - RPC data of the transaction.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  loading: boolean;
  txn: TransactionInfo;
  rpcTxn: RPCTransactionInfo;
}

import EventLogs from '@/includes/Common/Action/index';
import Actions from '@/includes/Common/Actions';
import Question from '@/includes/Common/Question';
import TxnStatus from '@/includes/Common/Status';
import {
  convertToMetricPrefix,
  convertToUTC,
  dollarFormat,
  gasPercentage,
  getTimeAgoString,
  localFormat,
  shortenToken,
  shortenTokenSymbol,
} from '@/includes/formats';
import ArrowDown from '@/includes/icons/ArrowDown';
import ArrowUp from '@/includes/icons/ArrowUp';
import FaCaretRight from '@/includes/icons/FaCaretRight';
import TokenImage from '@/includes/icons/TokenImage';
import {
  fiatValue,
  getConfig,
  nanoToMilli,
  shortenAddress,
  yoctoToNear,
} from '@/includes/libs';
import {
  tokenAmount,
  txnActions,
  txnErrorMessage,
  txnLogs,
} from '@/includes/near';
import {
  AccountContractInfo,
  FtsInfo,
  InventoryInfo,
  NftsInfo,
  StatusInfo,
  TransactionInfo,
  TransactionLog,
  RPCTransactionInfo,
} from '@/includes/types';

export default function (props: Props) {
  const { loading, txn, network, t, rpcTxn } = props;
  const [isContract, setIsContract] = useState(false);
  const [statsData, setStatsData] = useState<StatusInfo>({} as StatusInfo);
  const [price, setPrice] = useState(0);
  const [more, setMore] = useState(false);

  const { fts, nfts } = useMemo(() => {
    function customUniqWith(array: FtsInfo[], comparator: any) {
      return array.filter((item, index, arr) => {
        return arr.findIndex((el) => comparator(item, el)) === index;
      });
    }

    function tokensTransfers(receipts: InventoryInfo[]) {
      let fts: FtsInfo[] = [];
      let nfts: NftsInfo[] = [];

      receipts.forEach(
        (receipt) =>
          receipt?.fts?.forEach((ft) => {
            if (ft.ft_metas) fts.push(ft);
          }),
      );
      receipts.forEach(
        (receipt) =>
          receipt?.nfts?.forEach((nft) => {
            if (nft.nft_meta && nft.nft_token_meta) nfts.push(nft);
          }),
      );

      return {
        fts: customUniqWith(fts, (a: any, b: any) => {
          return (
            a.emitted_at_block_timestamp === b.emitted_at_block_timestamp &&
            a.token_new_owner_account_id === b.token_new_owner_account_id &&
            a.token_old_owner_account_id === b.token_old_owner_account_id &&
            a.amount === b.amount
          );
        }),
        nfts,
      };
    }

    if (txn?.receipts?.length) {
      return tokensTransfers(txn.receipts);
    }

    return { fts: [], nfts: [] };
  }, [txn]);

  const config = getConfig(network);

  useEffect(() => {
    function fetchStatsDatas() {
      if (txn) {
        asyncFetch(`${config.backendUrl}stats`)
          .then(
            (res: {
              body: {
                stats: StatusInfo;
              };
              status: number;
            }) => {
              const resp = res?.body?.stats;
              if (res.status === 200) {
                setStatsData(resp);
              }
            },
          )
          .catch(() => {});
      }
    }

    fetchStatsDatas();
  }, [txn, config.backendUrl]);

  const toggleContent = () => {
    setMore((prevState) => !prevState);
  };
  const currentPrice = statsData?.near_price || 0;

  const date = useMemo(() => {
    if (txn?.block_timestamp) {
      const timestamp = new Date(nanoToMilli(txn?.block_timestamp));
      function fetchPriceAtDate(date: string) {
        asyncFetch(
          `https://api.coingecko.com/api/v3/coins/near/history?date=${date}`,
        ).then(
          (data: {
            body: {
              market_data: { current_price: { usd: number } };
            };
            status: number;
          }) => {
            const resp = data?.body?.market_data?.current_price?.usd;
            if (data.status === 200) {
              setPrice(resp);
            }
          },
        );
      }
      let dt;
      const currentDate = new Date();
      if (currentDate > timestamp) {
        const day = timestamp.getUTCDate();
        const month = timestamp.getUTCMonth() + 1;
        const year = timestamp.getUTCFullYear();
        dt = `${day < 10 ? '0' : ''}${day}-${
          month < 10 ? '0' : ''
        }${month}-${year}`;
        fetchPriceAtDate(dt);
      }
    }
  }, [txn?.block_timestamp]);

  const [logs, actions, errorMessage] = useMemo(() => {
    if (rpcTxn) {
      return [txnLogs(rpcTxn), txnActions(rpcTxn), txnErrorMessage(rpcTxn)];
    }
    return [[], [], undefined];
  }, [rpcTxn]);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  useEffect(() => {
    if (txn?.receiver_account_id) {
      asyncFetch(`${config.backendUrl}account/${txn.receiver_account_id}`).then(
        (data: {
          body: {
            account: AccountContractInfo[];
          };
        }) => {
          const resp = data?.body?.account?.[0];
          setIsContract(resp?.code_hash !== '11111111111111111111111111111111');
        },
      );
    }
  }, [txn, config.backendUrl]);

  useEffect(() => {
    // Hide txn actions row
    if (typeof document !== 'undefined') {
      const row = document.getElementById('action-row');
      const column = document.getElementById('action-column');

      if (row && column && !column.hasChildNodes()) {
        row.style.display = 'none';
      }
    }
  }, [logs]);

  return (
    <div className="text-sm text-nearblue-600 divide-solid divide-gray-200 divide-y">
      <div className="text-sm text-nearblue-600">
        {context.networkId === 'testnet' && (
          <div className="flex flex-wrap p-4 text-red-500">
            {t
              ? t('txns:testnetNotice')
              : '[ This is a Testnet transaction only ]'}
          </div>
        )}
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.hash.tooltip')
                    : 'Unique identifier (hash) of this transaction.'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.hash.text.0') : 'Txn Hash'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 font-semibold break-words">
              {txn.transaction_hash ? txn.transaction_hash : ''}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-start p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.status.tooltip')
                    : 'The status of the transaction.'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.status.text.0') : 'Status'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div>
              {txn.outcomes?.status !== undefined && (
                <TxnStatus showLabel status={txn.outcomes?.status} />
              )}
              {errorMessage && (
                <div className="text-xs bg-orange-50 my-2 rounded-md text-center px-2 py-1">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.block.tooltip')
                    : 'The number of the block in which the transaction was recorded.'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.block.text.0') : 'Block height'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-14" />
            </div>
          ) : txn.block?.block_height ? (
            <div className="w-full md:w-3/4 font-semibold break-words">
              <a
                href={`/blocks/${txn.included_in_block_hash}`}
                className="hover:no-underline"
              >
                <a className="text-green-500 hover:no-underline">
                  {localFormat(txn.block?.block_height)}
                </a>
              </a>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.timestamp.tooltip')
                    : 'Timestamp of when this transaction was submitted.'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.timestamp.text.0') : 'Timestamp'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-sm" />
            </div>
          ) : txn?.block_timestamp ? (
            <div className="w-full md:w-3/4 break-words">
              {getTimeAgoString(nanoToMilli(txn?.block_timestamp))} (
              {convertToUTC(nanoToMilli(txn?.block_timestamp), true)} +UTC)
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      {(actions.length > 0 || logs.length > 0) && (
        <div id="action-row" className="bg-white text-sm text-nearblue-600">
          <div className="flex items-start flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div>
                      <Question className="w-4 h-4 fill-current mr-1" />
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    align="start"
                    side="bottom"
                  >
                    Highlighted events of the transaction
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              Transaction Actions
            </div>
            {loading ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-full max-w-xl" />
              </div>
            ) : (
              <div className="w-full md:w-3/4">
                <ScrollArea.Root>
                  <ScrollArea.Viewport />
                  <div
                    id="action-column"
                    className="max-h-[194px] break-words space-y-2"
                  >
                    {logs.map((event: TransactionLog, i: number) => (
                      <EventLogs key={i} event={event} network={network} />
                    ))}
                    {actions.map((action: any, i: number) => (
                      <Actions key={i} action={action} />
                    ))}
                  </div>
                  <ScrollArea.Scrollbar orientation="horizontal">
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                  <ScrollArea.Scrollbar orientation="vertical">
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="bg-white text-sm text-nearblue-600">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.from.tooltip')
                    : 'Account that signed and sent the transaction'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.from.text.0') : 'From'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-all">
              <a
                href={`/address/${txn.signer_account_id}`}
                className="hover:no-underline"
              >
                <a className="text-green-500 hover:no-underline">
                  {txn.signer_account_id}
                </a>
              </a>
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.to.tooltip')
                    : 'Account receiving the transaction.'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {isContract
              ? 'Interacted With (To)'
              : t
              ? t('txns:txn.to.text.0')
              : 'To'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-all">
              <a
                href={`/address/${txn.receiver_account_id}`}
                className="hover:no-underline"
              >
                <a className="text-green-500 hover:no-underline">
                  {txn.receiver_account_id}
                </a>
              </a>
            </div>
          )}
        </div>
      </div>
      {(fts?.length > 0 || nfts?.length > 0) && (
        <div className="flex items-start flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  List of tokens transferred in the transaction
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            Tokens Transferred
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xl" />
            </div>
          ) : (
            <div className="relative w-full md:w-3/4">
              <ScrollArea.Root className="w-full h-[302px] rounded overflow-hidden bg-white">
                <ScrollArea.Viewport className="w-full h-full rounded">
                  <div className="max-h-[302px] break-words space-y-3">
                    {fts?.map((ft: any) => (
                      <div
                        className="flex items-center flex-wrap break-all leading-7"
                        key={ft.key}
                      >
                        <FaCaretRight className="inline-flex text-gray-400 text-xs" />
                        <div className="font-semibold text-gray px-1">
                          From{' '}
                          {ft.token_old_owner_account_id ? (
                            <a
                              href={`/address/${ft.token_old_owner_account_id}`}
                              className="hover:no-underline"
                            >
                              <a className="text-green-500 font-normal pl-1 hover:no-underline">
                                {shortenAddress(ft.token_old_owner_account_id)}
                              </a>
                            </a>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                        <div className="font-semibold text-gray px-1">
                          To{' '}
                          {ft.token_new_owner_account_id ? (
                            <a
                              href={`/address/${ft.token_new_owner_account_id}`}
                              className="hover:no-underline"
                            >
                              <a className="text-green-500 font-normal pl-1">
                                {shortenAddress(ft.token_new_owner_account_id)}
                              </a>
                            </a>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                        <div className="font-semibold text-gray px-1">
                          For{' '}
                          <span className="pl-1 font-normal">
                            {tokenAmount(ft.amount, ft.ft_metas.decimals, true)}
                          </span>
                        </div>
                        <a
                          href={`/token/${ft.ft_metas.contract}`}
                          className="hover:no-underline"
                        >
                          <a className="text-green flex items-center hover:no-underline">
                            <TokenImage
                              src={ft.ft_metas.icon}
                              alt={ft.ft_metas.name}
                              className="w-4 h-4 mx-1"
                            />
                            {shortenToken(ft.ft_metas.name)}
                            <span>
                              &nbsp;({shortenTokenSymbol(ft.ft_metas.symbol)})
                            </span>
                          </a>
                        </a>
                      </div>
                    ))}
                    {nfts?.map((nft: any) => (
                      <div className="flex" key={nft.key}>
                        <div className="flex justify-start items-start">
                          <FaCaretRight className="inline-flex text-gray-400 text-xs mt-1" />
                          <div className="flex flex-wrap">
                            <div>
                              <div className="sm:flex">
                                <div className="font-semibold text-gray px-1">
                                  From{' '}
                                  {nft.token_old_owner_account_id ? (
                                    <a
                                      href={`/address/${nft.token_old_owner_account_id}`}
                                      className="hover:no-underline"
                                    >
                                      <a className="text-green-500 font-normal pl-1 hover:no-underline">
                                        {shortenAddress(
                                          nft.token_old_owner_account_id,
                                        )}
                                      </a>
                                    </a>
                                  ) : (
                                    <span className="font-normal pl-1">
                                      system
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-gray px-1">
                                  To{' '}
                                  {nft.token_new_owner_account_id ? (
                                    <a
                                      href={`/address/${nft.token_new_owner_account_id}`}
                                      className="hover:no-underline"
                                    >
                                      <a className="text-green-500 font-normal pl-1 hover:no-underline">
                                        {shortenAddress(
                                          nft.token_new_owner_account_id,
                                        )}
                                      </a>
                                    </a>
                                  ) : (
                                    <span className="font-normal pl-1">
                                      system
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="sm:flex mt-1">
                                <div className="text-gray px-1">
                                  <span className="text-gray-400">For </span>
                                  <span className="pl-1 font-normal">
                                    NFT Token ID [
                                    <a
                                      href={`/nft-token/${nft.nft_meta.contract}/${nft.token_id}`}
                                      className="hover:no-underline"
                                    >
                                      <a className="text-green hover:no-underline">
                                        {shortenToken(nft.token_id)}
                                      </a>
                                    </a>
                                    ]
                                  </span>
                                </div>
                                <a
                                  href={`/nft-token/${nft.nft_meta.contract}`}
                                  className="hover:no-underline"
                                >
                                  <a className="text-green flex items-center hover:no-underline">
                                    <TokenImage
                                      src={nft.nft_meta.icon}
                                      alt={nft.nft_meta.name}
                                      className="w-4 h-4 mx-1"
                                    />
                                    {shortenToken(nft.nft_meta.name)}
                                    <span>
                                      &nbsp;(
                                      {shortenTokenSymbol(nft.nft_meta.symbol)})
                                    </span>
                                  </a>
                                </a>
                              </div>
                            </div>
                            <div className="border rounded ml-2 w-11 h-11 p-1">
                              <a
                                href={`/nft-token/${nft.nft_meta.contract}/${nft.token_id}`}
                                className="hover:no-underline"
                              >
                                <a>
                                  {
                                    <Widget
                                      src={`${config.ownerId}/widget/bos-components.components.Shared.NFTImage`}
                                      props={{
                                        base: nft.nft_meta.base_uri,
                                        media: nft.nft_token_meta.media,
                                        reference:
                                          nft.nft_meta.reference ||
                                          nft.nft_token_meta.reference,
                                        alt: nft.nft_token_meta.title,
                                        className: 'max-h-full rounded',
                                        network: network,
                                      }}
                                    />
                                  }
                                </a>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-0.5 bg-neargray-25 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="vertical"
                >
                  <ScrollArea.Thumb className="flex-1 bg-neargray-50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-0.5 bg-neargray-25 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="horizontal"
                >
                  <ScrollArea.Thumb className="flex-1 bg-neargray-50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner className="bg-neargray-50" />
              </ScrollArea.Root>
            </div>
          )}
        </div>
      )}
      <div className="bg-white text-sm text-nearblue-600">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.deposit.tooltip')
                    : 'Sum of all NEAR tokens transferred from the Signing account to the Receiver account. This includes tokens sent in a Transfer action(s), and as deposits on Function Call action(s).'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.deposit.text.0') : 'Deposit Value'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span>
                      {yoctoToNear(txn.actions_agg?.deposit || 0, true)} Ⓝ
                      {currentPrice && context.networkId === 'mainnet'
                        ? ` ($${fiatValue(
                            yoctoToNear(txn.actions_agg?.deposit || 0, false),
                            currentPrice,
                          )})`
                        : ''}
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    align="start"
                    side="bottom"
                  >
                    {t
                      ? t('txns:txn.deposit.tooltip')
                      : 'Sum of all NEAR tokens transferred from the Signing account to the Receiver account. This includes tokens sent in a Transfer action(s), and as deposits on Function Call action(s).'}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          )}
        </div>
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.fee.tooltip')
                    : 'Total fee paid in NEAR to execute this transaction.'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.fee.text.0') : 'Transaction fee'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {yoctoToNear(txn.outcomes_agg?.transaction_fee || 0, true)} Ⓝ
              {currentPrice && context.networkId === 'mainnet'
                ? ` ($${fiatValue(
                    yoctoToNear(txn.outcomes_agg?.transaction_fee || 0, false),
                    currentPrice,
                  )})`
                : ''}
            </div>
          )}
        </div>
      </div>
      {context.networkId === 'mainnet' && date && (
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  align="start"
                  side="bottom"
                >
                  {t
                    ? t('txns:txn.price.tooltip')
                    : 'Closing price of Ⓝ on date of transaction'}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
            {t ? t('txns:txn.price.text.0') : 'Ⓝ Price'}
          </div>
          {loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-32" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {price ? `$${dollarFormat(price)} / Ⓝ` : 'N/A'}
            </div>
          )}
        </div>
      )}

      <Accordion.Root
        type="single"
        className="text-sm text-nearblue-600 divide-solid divide-gray-200 divide-y border-b"
        defaultValue={more ? 'item-1' : undefined}
        collapsible
      >
        <Accordion.Item value="item-1">
          <Accordion.Header data-orientation="vertical">
            <div className="flex flex-wrap p-4">
              <Accordion.Trigger asChild onClick={toggleContent}>
                {!more ? (
                  <span className="text-green-500 flex items-center">
                    Click to see more <ArrowDown className="fill-current" />
                  </span>
                ) : (
                  <span className="text-green-500 flex items-center">
                    Click to see less <ArrowUp className="fill-current" />
                  </span>
                )}
              </Accordion.Trigger>
            </div>
          </Accordion.Header>
          <Accordion.Content>
            <div>
              <div className="flex flex-wrap p-4">
                <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        align="start"
                        side="bottom"
                      >
                        {t
                          ? t('txns:txn.gas.tooltip')
                          : 'Maximum amount of gas allocated for the transaction & the amount eventually used.'}
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                  {t ? t('txns:txn.gas.text.0') : 'Gas Limit & Usage by Txn'}
                </div>
                {loading ? (
                  <div className="w-full md:w-3/4">
                    <Loader wrapperClassName="flex w-full max-w-xs" />
                  </div>
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {convertToMetricPrefix(
                      Number(txn.actions_agg?.gas_attached || 0),
                    ) + 'gas'}
                    <span className="text-gray-300 px-1">|</span>{' '}
                    {convertToMetricPrefix(
                      Number(txn.outcomes_agg?.gas_used || 0),
                    ) + 'gas'}
                    (
                    {gasPercentage(
                      txn.outcomes_agg?.gas_used,
                      txn.actions_agg?.gas_attached,
                    )}
                    )
                  </div>
                )}
              </div>
              <div className="flex flex-wrap p-4">
                <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Question className="w-4 h-4 fill-current mr-1" />
                      </Tooltip.Trigger>
                      <Tooltip.Content
                        className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        align="start"
                        side="bottom"
                      >
                        {t
                          ? t('txns:txn.burnt.tooltip')
                          : 'Total amount of Gas & Token burnt from this transaction.'}
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                  {t ? t('txns:txn.burnt.text.0') : 'Burnt Gas & Tokens by Txn'}
                </div>
                {loading ? (
                  <div className="w-full md:w-3/4">
                    <Loader wrapperClassName="flex w-full max-w-xs" />
                  </div>
                ) : (
                  <div className="w-full  text-xs items-center flex md:w-3/4 break-words">
                    <div className="bg-orange-50 rounded-md px-2 py-1">
                      <span className="text-xs mr-2">🔥</span>
                      {convertToMetricPrefix(
                        Number(txn.receipt_conversion_gas_burnt || 0),
                      ) + 'gas'}
                      <span className="text-gray-300 px-1">|</span>{' '}
                      {yoctoToNear(
                        Number(txn.receipt_conversion_tokens_burnt || 0),
                        true,
                      )}{' '}
                      Ⓝ
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
