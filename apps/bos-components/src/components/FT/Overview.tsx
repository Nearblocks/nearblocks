/**
 * Component: FTOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Fungible Token Overview on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The token identifier passed as a string
 * @param {string} [tokenFilter] - The token filter identifier passed as a string
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [onFilterClear] - Function to clear a specific or all filters. (Optional)
 *                                   Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 * @param {string} ownerId - The identifier of the owner of the component.
 * @param {function} [onHandleTab] - Function to handle tab changes. (Optional)
 *                                    Example: onTab={onHandleTab} where onHandleTab is a function to change tab on the page.
 * @param {string} [pageTab] - The page tab being displayed. (Optional)
 *                                 Example: If provided, tab=transfer in the url it will select the transfer tab of token details.
 * @param {Function} [requestSignInWithWallet] - Function to initiate sign-in with a wallet.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string;
  id: string;
  tokenFilter?: string;
  filters?: { [key: string]: string };
  onFilterClear?: (name: string) => void;
  onHandleTab: (value: string) => void;
  pageTab: string;
  requestSignInWithWallet: () => void;
}

import ErrorMessage from '@/includes/Common/ErrorMessage';
import Links from '@/includes/Common/Links';
import Skeleton from '@/includes/Common/Skeleton';
import FaInbox from '@/includes/icons/FaInbox';
import Question from '@/includes/icons/Question';
import TokenImage from '@/includes/icons/TokenImage';
import WarningIcon from '@/includes/icons/WarningIcon';
import { SpamToken, Status, StatusInfo, Token } from '@/includes/types';

export default function ({
  network,
  t,
  id,
  tokenFilter,
  filters,
  onFilterClear,
  ownerId,
  onHandleTab,
  pageTab,
  requestSignInWithWallet,
}: Props) {
  const { dollarFormat, dollarNonCentFormat, localFormat, getTimeAgoString } =
    VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const { getConfig, handleRateLimit, nanoToMilli, fetchData } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const tabs = [
    t ? t('token:fts.ft.transfers') : 'Transfers',
    t ? t('token:fts.ft.holders') : 'Holders',
    'Info',
    'FAQ',
    'Comments',
    'Feeds',
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [holderLoading, setHolderLoading] = useState(false);
  const [stats, setStats] = useState<StatusInfo>({} as StatusInfo);
  const [token, setToken] = useState<Token>({} as Token);
  const [spamTokens, setSpamTokens] = useState<SpamToken>({ blacklist: [] });
  const [transfers, setTransfers] = useState('');
  const [holders, setHolders] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [showMarketCap, setShowMarketCap] = useState(false);
  const [status, setStatus] = useState({
    height: 0,
    sync: true,
    timestamp: '',
  });
  const config = getConfig && getConfig(network);
  useEffect(() => {
    function fetchFTData() {
      setIsLoading(true);
      asyncFetch(`${config.backendUrl}fts/${id}`)
        .then(
          (data: {
            body: {
              contracts: Token[];
            };
            status: number;
          }) => {
            const resp = data?.body?.contracts?.[0];
            if (data.status === 200) {
              setToken(resp || {});
              setIsLoading(false);
            } else {
              handleRateLimit(data, fetchFTData, () => setIsLoading(false));
            }
          },
        )
        .catch(() => {});
    }

    function fetchTxnsCount() {
      setTxnLoading(true);
      asyncFetch(`${config.backendUrl}fts/${id}/txns/count`)
        .then(
          (data: {
            body: {
              txns: { count: string }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTransfers(resp.count);
              setTxnLoading(false);
            } else {
              handleRateLimit(data, fetchTxnsCount, () => setTxnLoading(false));
            }
          },
        )
        .catch(() => {});
    }

    function fetchStatsData() {
      asyncFetch(`${config?.backendUrl}stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const data = res.body;
          if (res.status === 200) {
            setStats(data.stats[0]);
          } else {
            handleRateLimit(data, fetchStatsData);
          }
        })
        .catch(() => {})
        .finally(() => {});
    }
    function fetchHoldersCount() {
      setHolderLoading(true);
      asyncFetch(`${config.backendUrl}fts/${id}/holders/count`)
        .then(
          (data: {
            body: {
              holders: { count: string }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.holders?.[0];
            if (data.status === 200) {
              setHolders(resp.count);
              setHolderLoading(false);
            } else {
              handleRateLimit(data, fetchHoldersCount, () =>
                setHolderLoading(false),
              );
            }
          },
        )
        .catch(() => {});
    }
    function fetchStatus() {
      asyncFetch(`${config.backendUrl}sync/status`)
        .then(
          (data: {
            body: {
              status: Status;
            };
            status: number;
          }) => {
            const resp = data?.body?.status?.aggregates.ft_holders;
            if (data.status === 200) {
              setStatus(resp);
            } else {
              handleRateLimit(data, fetchStatus);
            }
          },
        )
        .catch(() => {});
    }

    fetchData &&
      fetchData(
        'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
        (response: any) => {
          const data = JSON.parse(response);
          setSpamTokens(data);
        },
      );
    if (config?.backendUrl) {
      fetchStatsData();
      fetchFTData();
      fetchTxnsCount();
      fetchHoldersCount();
      fetchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.backendUrl, id]);

  function isTokenSpam(tokenName: string) {
    if (spamTokens)
      for (const spamToken of spamTokens.blacklist) {
        const cleanedToken = spamToken.replace(/^\*/, '');
        if (tokenName.endsWith(cleanedToken)) {
          return true;
        }
      }
    return false;
  }
  const handleClose = () => {
    setIsVisible(false);
  };
  const onTab = (index: number) => {
    onHandleTab(tabs[index]);
  };

  const onToggle = () => setShowMarketCap((o) => !o);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap pt-4">
        {isLoading ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="break-all text-xl text-gray-700 dark:text-neargray-10 leading-8 py-4 px-2">
            <span className="inline-flex align-middle h-7 w-7">
              <TokenImage
                src={token?.icon}
                alt={token?.name}
                appUrl={config?.appUrl}
                className="w-7 h-7"
              />
            </span>
            <span className="inline-flex align-middle mx-1">Token:</span>
            <span className="inline-flex align-middle font-semibold">
              {token?.name}
            </span>
          </h1>
        )}
      </div>
      <div>
        {isTokenSpam(token.contract || id) && isVisible && (
          <>
            <div className="w-full flex justify-between text-left border dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300 bg-red-50 border-red-100 text-red-500 text-sm rounded-lg p-4">
              <p className="items-center">
                <WarningIcon className="w-5 h-5 fill-current mx-1 inline-flex" />
                This token is reported to have been spammed to many users.
                Please exercise caution when interacting with it. Click
                <a
                  href="https://github.com/Nearblocks/spam-token-list"
                  className="underline mx-0.5"
                  target="_blank"
                >
                  here
                </a>
                for more info.
              </p>
              <span
                className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 cursor-pointer"
                onClick={handleClose}
              >
                X
              </span>
            </div>
            <div className="py-2"></div>
          </>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                Overview
              </h2>

              <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex divide-x dark:divide-black-200  my-2">
                  <div className="flex-col flex-1 flex-wrap py-1">
                    <div className="w-full text-nearblue-700 text-xs uppercase mb-1  text-[80%]">
                      Price
                    </div>
                    {isLoading ? (
                      <div className="w-20">
                        <Skeleton className="h-4" />
                      </div>
                    ) : token?.price !== null && token?.price !== undefined ? (
                      <div className="w-full break-words flex flex-wrap text-sm">
                        ${localFormat(token?.price)}
                        {stats?.near_price && (
                          <div className="text-nearblue-700 mx-1 text-sm flex flex-row items-center">
                            @{' '}
                            {localFormat(
                              (
                                Big(token?.price) / Big(stats?.near_price)
                              ).toString(),
                            )}{' '}
                            Ⓝ
                          </div>
                        )}
                        {token?.change_24 !== null &&
                        token?.change_24 !== undefined ? (
                          Number(token?.change_24) > 0 ? (
                            <div className="text-neargreen text-sm flex flex-row items-center">
                              {' '}
                              (+{dollarFormat(token?.change_24)}%)
                            </div>
                          ) : (
                            <div className="text-red-500 text-sm flex flex-row items-center">
                              {' '}
                              ({dollarFormat(token?.change_24)}%)
                            </div>
                          )
                        ) : null}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div className="flex-col flex-1 flex-wrap py-1 px-3">
                    <div className="w-full text-nearblue-700 text-xs  mb-1 flex  text-[80%]">
                      <span className="uppercase">
                        {showMarketCap
                          ? 'CIRCULATING SUPPLY MARKET CAP'
                          : 'FULLY DILUTED MARKET CAP'}
                      </span>
                      <span>
                        <OverlayTrigger
                          placement="bottom-start"
                          delay={{ show: 500, hide: 0 }}
                          overlay={
                            <Tooltip className="fixed h-auto max-w-xs bg-black  bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words">
                              {
                                'Calculated by multiplying the tokens Total Supply on Near with the current market price per token.'
                              }
                            </Tooltip>
                          }
                        >
                          <Question className="w-4 h-4 fill-current ml-1" />
                        </OverlayTrigger>
                      </span>
                    </div>
                    {isLoading ? (
                      <div className="w-20">
                        <Skeleton className="h-4" />
                      </div>
                    ) : (token?.fully_diluted_market_cap !== null &&
                        token?.fully_diluted_market_cap !== undefined) ||
                      (token?.market_cap !== null &&
                        token?.market_cap !== undefined) ? (
                      <div className="w-full break-words flex flex-wrap text-sm">
                        {token?.fully_diluted_market_cap !== null &&
                        token?.fully_diluted_market_cap !== undefined &&
                        token?.market_cap !== null &&
                        token?.market_cap !== undefined ? (
                          <OverlayTrigger
                            placement="bottom-start"
                            delay={{ show: 500, hide: 0 }}
                            overlay={
                              <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words">
                                {showMarketCap
                                  ? 'Click to switch back'
                                  : 'Click to switch'}
                              </Tooltip>
                            }
                          >
                            <p
                              className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100 dark:bg-black-200"
                              onClick={onToggle}
                            >
                              {showMarketCap
                                ? '$' + dollarNonCentFormat(token?.market_cap)
                                : '$' +
                                  dollarNonCentFormat(
                                    token?.fully_diluted_market_cap,
                                  )}
                            </p>
                          </OverlayTrigger>
                        ) : (
                          <p className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100 dark:bg-black-200">
                            {'$' +
                              dollarNonCentFormat(
                                Number(token?.market_cap)
                                  ? token?.market_cap
                                  : token?.fully_diluted_market_cap,
                              )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full break-words flex flex-wrap text-sm">
                        {token?.onchain_market_cap ? (
                          <p className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100 dark:bg-black-200">
                            ${dollarNonCentFormat(token?.onchain_market_cap)}
                          </p>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Max Total Supply:
                  </div>
                  {isLoading ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {token?.total_supply
                        ? dollarNonCentFormat(token?.total_supply)
                        : token?.total_supply ?? ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Transfers:
                  </div>
                  {txnLoading ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {transfers ? localFormat(transfers) : transfers ?? ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Holders:</div>
                  {holderLoading ? (
                    <div className="w-32">
                      <Skeleton className="h-4" />
                    </div>
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      <div className="flex items-center">
                        {holders ? localFormat(holders) : holders ?? ''}
                        {!status.sync && (
                          <OverlayTrigger
                            placement="bottom-start"
                            delay={{ show: 500, hide: 0 }}
                            overlay={
                              <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words">
                                Holders count is out of sync. Last synced block
                                is
                                <span className="font-bold mx-0.5">
                                  {localFormat && localFormat(status.height)}
                                </span>
                                {status?.timestamp &&
                                  `(${getTimeAgoString(
                                    nanoToMilli(status?.timestamp),
                                  )}).`}
                                Holders data will be delayed.
                              </Tooltip>
                            }
                          >
                            <WarningIcon className="w-4 h-4 fill-current ml-1" />
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                Profile Summary
              </h2>
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Contract:</div>
                  {isLoading ? (
                    <div className="w-full md:w-3/4 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-green-500 dark:text-green-250 md:w-3/4 break-words">
                      <Link href={`/address/${token?.contract}`}>
                        <a className="text-green-500 dark:text-green-250">
                          {token?.contract}
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Decimals:</div>
                  <div className="w-full md:w-3/4 break-words">
                    {isLoading ? (
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    ) : (
                      token?.decimals
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Official Site:
                  </div>
                  <div className="w-full md:w-3/4 text-green-500 dark:text-green-250 break-words">
                    {isLoading ? (
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    ) : (
                      <a
                        href={`${token?.website}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {token?.website}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Social Profiles:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {isLoading ? (
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    ) : (
                      <Links meta={token} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
        {tokenFilter && (
          <Widget
            src={`${ownerId}/widget/bos-components.components.FT.TokenFilter`}
            props={{
              network: network,
              id: id,
              tokenFilter: tokenFilter,
              ownerId,
            }}
          />
        )}
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <div>
              {tabs &&
                tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => onTab(index)}
                    className={`text-nearblue-600 text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                      pageTab === tab
                        ? 'rounded-lg bg-green-600 dark:bg-green-250  text-white'
                        : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 dark:text-white dark:hover:text-neargray-25  dark:bg-black-200'
                    }`}
                    value={tab}
                  >
                    {tab === 'FAQ' && token ? <h2>{tab}</h2> : <h2>{tab}</h2>}
                  </button>
                ))}
            </div>
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className={`${pageTab === 'Transfers' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.FT.Transfers`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      filters: filters,
                      onFilterClear: onFilterClear,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Holders' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.FT.Holders`}
                    props={{
                      network: network,
                      id: id,
                      token: token,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Info' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.FT.Info`}
                    props={{
                      network: network,
                      id: id,
                      token: token,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'FAQ' ? '' : 'hidden'} `}>
                {!isLoading &&
                  (Object.keys(token).length > 0 ? (
                    <Widget
                      src={`${ownerId}/widget/bos-components.components.FT.FAQ`}
                      props={{
                        network: network,
                        id: id,
                        token: token,
                        ownerId,
                      }}
                    />
                  ) : (
                    <div className="px-6 py-4 dark:text-gray-400 text-nearblue-700 text-xs">
                      <ErrorMessage
                        icons={<FaInbox />}
                        message="There are no matching entries"
                        mutedText="Please try again later"
                      />
                    </div>
                  ))}
              </div>{' '}
              <div className={`${pageTab === 'Comments' ? '' : 'hidden'} `}>
                <div className="py-3">
                  {
                    <Widget
                      src={`${ownerId}/widget/bos-components.components.Comments.Feed`}
                      props={{
                        network: network,
                        path: `nearblocks.io/ft/${id}`,
                        limit: 10,
                        ownerId,
                        requestSignInWithWallet,
                      }}
                    />
                  }
                </div>
              </div>
              <div className={`${pageTab === 'Feeds' ? '' : 'hidden'} `}>
                <div className="py-3">
                  {
                    <Widget
                      loading={
                        <div className="loader">
                          <span
                            className="spinner-grow spinner-grow-sm me-1"
                            role="status"
                            aria-hidden="true"
                          />
                          Loading ...
                        </div>
                      }
                      src={`${ownerId}/widget/bos-components.components.Feeds.Feed`}
                      props={{
                        network: network,
                        path: ``,
                        limit: 10,
                        ownerId,
                        accounts: 'vaishnav_v.near',
                        commentAccounts: 'vaishnav_v.near',
                      }}
                    />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
