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
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string;
  id: string;
  tokenFilter?: string;
  filters?: { [key: string]: string };
  onFilterClear?: (name: string) => void;
}

import Links from '@/includes/Common/Links';
import Skeleton from '@/includes/Common/Skeleton';
import Question from '@/includes/icons/Question';
import TokenImage from '@/includes/icons/TokenImage';
import { StatusInfo, Token } from '@/includes/types';

export default function ({
  network,
  t,
  id,
  tokenFilter,
  filters,
  onFilterClear,
  ownerId,
}: Props) {
  const { dollarFormat, dollarNonCentFormat, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const tabs = [
    t ? t('token:fts.ft.transfers') : 'Transfers',
    t ? t('token:fts.ft.holders') : 'Holders',
    'Info',
    'FAQ',
    'Comments',
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [holderLoading, setHolderLoading] = useState(false);
  const [stats, setStats] = useState<StatusInfo>({} as StatusInfo);
  const [token, setToken] = useState<Token>({} as Token);
  const [transfers, setTransfers] = useState('');
  const [holders, setHolders] = useState('');
  const [pageTab, setPageTab] = useState('Transfers');
  const [showMarketCap, setShowMarketCap] = useState(false);

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
              setToken(resp);
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
    if (config?.backendUrl) {
      fetchStatsData();
      fetchFTData();
      fetchTxnsCount();
      fetchHoldersCount();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.backendUrl, id]);

  const onTab = (index: number) => {
    setPageTab(tabs[index]);
    onFilterClear && onFilterClear('');
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
          token && (
            <h1 className="break-all space-x-2 text-xl text-gray-700 leading-8 py-4 px-2">
              <span className="inline-flex align-middle h-7 w-7">
                <TokenImage
                  src={token?.icon}
                  alt={token?.name}
                  className="w-7 h-7"
                />
              </span>
              <span className="inline-flex align-middle ">Token: </span>
              <span className="inline-flex align-middle font-semibold">
                {token?.name}
              </span>
            </h1>
          )
        )}
      </div>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                Overview
              </h2>

              <div className="px-3 divide-y text-sm text-nearblue-600">
                <div className="flex divide-x my-2">
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
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <Question className="w-4 h-4 fill-current ml-1" />
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="start"
                              side="bottom"
                            >
                              {
                                'Calculated by multiplying the tokens Total Supply on Near with the current market price per token.'
                              }
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
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
                          <Tooltip.Provider>
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <p
                                  className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100"
                                  onClick={onToggle}
                                >
                                  $
                                  {showMarketCap
                                    ? dollarNonCentFormat(token?.market_cap)
                                    : dollarNonCentFormat(
                                        token?.fully_diluted_market_cap,
                                      )}
                                </p>
                              </Tooltip.Trigger>
                              <Tooltip.Content
                                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                                align="start"
                                side="bottom"
                              >
                                {showMarketCap
                                  ? 'Click to switch back'
                                  : 'Click to switch'}
                              </Tooltip.Content>
                            </Tooltip.Root>
                          </Tooltip.Provider>
                        ) : (
                          <p className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100">
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
                          <p className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100">
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
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <Question className="w-4 h-4 fill-current ml-1" />
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="start"
                              side="bottom"
                            >
                              Token holders will update soon
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                Profile Summary
              </h2>
              <div className="px-3 divide-y text-sm text-nearblue-600">
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Contract:</div>
                  {isLoading ? (
                    <div className="w-full md:w-3/4 break-words">
                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-green-500 md:w-3/4 break-words">
                      <Link href={`/address/${token?.contract}`}>
                        <a className="text-green-500">{token?.contract}</a>
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
                  <div className="w-full md:w-3/4 text-green-500 break-words">
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
                        ? 'rounded-lg bg-green-600 text-white'
                        : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600'
                    }`}
                    value={tab}
                  >
                    {tab === 'FAQ' && token ? <h2>{tab}</h2> : <h2>{tab}</h2>}
                  </button>
                ))}
            </div>
            <div className="bg-white soft-shadow rounded-xl pb-1">
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
              {token && (
                <div className={`${pageTab === 'FAQ' ? '' : 'hidden'} `}>
                  {
                    <Widget
                      src={`${ownerId}/widget/bos-components.components.FT.FAQ`}
                      props={{
                        network: network,
                        id: id,
                        token: token,
                        ownerId,
                      }}
                    />
                  }
                </div>
              )}{' '}
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
