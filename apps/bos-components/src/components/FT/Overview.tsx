/**
 * Component: FTOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Fungible Token Overview on Near Protocol.
 * @interface Props
 * @param {string} id - The token identifier passed as a string
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [network] - The network data to show, either mainnet or testnet
 */

interface Props {
  id: string;
  network: string;
  t: (key: string) => string;
}

import Links from '@/includes/Common/Links';
import Skeleton from '@/includes/Common/Skeleton';
import {
  dollarFormat,
  dollarNonCentFormat,
  localFormat,
} from '@/includes/formats';
import Question from '@/includes/icons/Question';
import TokenImage from '@/includes/icons/TokenImage';
import { getConfig } from '@/includes/libs';
import { StatusInfo, Token } from '@/includes/types';

export default function ({ network, id, t }: Props) {
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
  const [transfers, setTransfers] = useState(0);
  const [holders, setHolders] = useState(0);
  const [pageTab, setPageTab] = useState('Transfers');
  const [showMarketCap, setShowMarketCap] = useState(false);
  const config = getConfig(network);

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
            }
            setIsLoading(false);
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
              txns: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTransfers(resp.count);
            }
            setTxnLoading(false);
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
              holders: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.holders?.[0];
            if (data.status === 200) {
              setHolders(resp.count);
            }
            setHolderLoading(false);
          },
        )
        .catch(() => {});
    }
    fetchStatsData();
    fetchFTData();
    fetchTxnsCount();
    fetchHoldersCount();
  }, [config.backendUrl, id]);

  const onTab = (index: number) => {
    setPageTab(tabs[index]);
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
          <h1 className="break-all space-x-2 text-xl text-gray-700 leading-8 py-4 px-2">
            <span className="inline-flex align-middle h-7 w-7">
              <TokenImage
                src={token.icon}
                alt={token.name}
                className="w-7 h-7"
              />
            </span>
            <span className="inline-flex align-middle ">Token: </span>
            <span className="inline-flex align-middle font-semibold">
              {token.name}
            </span>
          </h1>
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
                        ${dollarFormat(token?.price)}
                        {stats?.near_price && (
                          <div className="text-nearblue-700 mx-1 text-sm flex flex-row items-center">
                            @ {localFormat(token?.price / stats?.near_price)} Ⓝ
                          </div>
                        )}
                        {token?.change_24 !== null &&
                        token?.change_24 !== undefined ? (
                          token?.change_24 > 0 ? (
                            <div className="text-neargreen text-sm flex flex-row items-center">
                              {' '}
                              (+{dollarFormat(token?.change_24)}%)
                            </div>
                          ) : (
                            <div className="text-red-500 text-sm flex flex-row items-center">
                              {' '}
                              ({dollarFormat(token?.change_24 || 0)}%)
                            </div>
                          )
                        ) : null}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div className="flex-col flex-1 flex-wrap py-1 px-3">
                    <div className="w-full text-nearblue-700 text-xs uppercase mb-1 flex  text-[80%]">
                      {showMarketCap
                        ? 'CIRCULATING SUPPLY MARKET CAP'
                        : 'FULLY DILUTED MARKET CAP'}
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
                            $
                            {dollarNonCentFormat(
                              token?.market_cap ||
                                token?.fully_diluted_market_cap ||
                                0,
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
                      {dollarNonCentFormat(token?.total_supply || 0)}
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
                      {localFormat(transfers)}
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
                      {localFormat(holders)}
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
                      <a href={`/address/${token?.contract}`}>
                        <a className="text-green-500">{token?.contract}</a>
                      </a>
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
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <Tabs.Root defaultValue={pageTab}>
              <Tabs.List>
                {tabs &&
                  tabs.map((tab, index) => (
                    <Tabs.Trigger
                      key={index}
                      onClick={() => onTab(index)}
                      className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                        pageTab === tab
                          ? 'rounded-lg bg-green-600 text-white'
                          : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600'
                      }`}
                      value={tab}
                    >
                      <h2>{tab}</h2>
                    </Tabs.Trigger>
                  ))}
              </Tabs.List>
              <div className="bg-white soft-shadow rounded-xl pb-1">
                <Tabs.Content value={tabs[0]}>
                  {
                    <Widget
                      src={`${config.ownerId}/widget/bos-components.components.FT.Transfers`}
                      props={{
                        network: network,
                        id: id,
                        t: t,
                      }}
                    />
                  }
                </Tabs.Content>
                <Tabs.Content value={tabs[1]}>
                  {
                    <Widget
                      src={`${config.ownerId}/widget/bos-components.components.FT.Holders`}
                      props={{
                        network: network,
                        id: id,
                        token: token,
                      }}
                    />
                  }
                </Tabs.Content>
                <Tabs.Content clssName="border-t" value={tabs[2]}>
                  {
                    <Widget
                      src={`${config.ownerId}/widget/bos-components.components.FT.Info`}
                      props={{
                        network: network,
                        id: id,
                        token: token,
                      }}
                    />
                  }
                </Tabs.Content>
                <Tabs.Content value={tabs[3]}>
                  {
                    <Widget
                      src={`${config.ownerId}/widget/bos-components.components.FT.FAQ`}
                      props={{
                        network: network,
                        id: id,
                        token: token,
                      }}
                    />
                  }
                </Tabs.Content>{' '}
                <Tabs.Content value={tabs[4]}>
                  <div className="px-4 sm:px-6 py-3"></div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </>
  );
}
