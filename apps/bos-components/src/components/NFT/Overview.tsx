/**
 * Component: NFTOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Overview.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 * @param {string} ownerId - The identifier of the owner of the component.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 */

interface Props {
  ownerId: string;
  network: string;
  id: string;
  t: (key: string) => string | undefined;
}

import Links from '@/includes/Common/Links';
import Skeleton from '@/includes/Common/Skeleton';
import TokenImage from '@/includes/icons/TokenImage';
import WarningIcon from '@/includes/icons/WarningIcon';
import { SpamToken, Status, Token } from '@/includes/types';

const tabs = ['Transfers', 'Holders', 'Inventory', 'Comments'];

export default function ({ network, id, ownerId, t }: Props) {
  const { localFormat, getTimeAgoString } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, nanoToMilli, fetchData } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [holderLoading, setHolderLoading] = useState(false);
  const [token, setToken] = useState<Token>({} as Token);
  const [transfers, setTransfers] = useState('');
  const [holders, setHolders] = useState('');
  const [pageTab, setPageTab] = useState('Transfers');
  const [status, setStatus] = useState({
    height: 0,
    sync: true,
    timestamp: '',
  });
  const [spamTokens, setSpamTokens] = useState<SpamToken>({ blacklist: [] });
  const [isVisible, setIsVisible] = useState(true);
  const handleClose = () => {
    setIsVisible(false);
  };
  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchNFTData() {
      setIsLoading(true);
      asyncFetch(`${config.backendUrl}nfts/${id}`)
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
              handleRateLimit(data, fetchNFTData, () => setIsLoading(false));
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
            const resp = data?.body?.status?.aggregates.nft_holders;
            if (data.status === 200) {
              setStatus(resp);
            } else {
              handleRateLimit(data, fetchStatus);
            }
          },
        )
        .catch(() => {});
    }
    function fetchTxnsCount() {
      setTxnLoading(true);
      asyncFetch(`${config.backendUrl}nfts/${id}/txns/count`)
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

    function fetchHoldersCount() {
      setHolderLoading(true);
      asyncFetch(`${config.backendUrl}nfts/${id}/holders/count`)
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
    fetchData &&
      fetchData(
        'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
        (response: any) => {
          const data = JSON.parse(response);
          setSpamTokens(data);
        },
      );

    if (config?.backendUrl) {
      fetchNFTData();
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
  const onTab = (index: number) => {
    setPageTab(tabs[index]);
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap pt-4">
        {isLoading ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="break-all space-x-2 text-xl text-nearblue-600 dark:text-neargray-10 leading-8 py-4 px-2">
            <span className="inline-flex align-middle h-7 w-7">
              <TokenImage
                src={token?.icon}
                alt={token?.name}
                className="w-7 h-7"
                appUrl={config?.appUrl}
              />
            </span>
            <span className="inline-flex align-middle ">Token: </span>
            <span className="inline-flex align-middle font-semibold">
              {token?.name}
            </span>
          </h1>
        )}
      </div>
      {isTokenSpam(token?.contract || id) && isVisible && (
        <>
          <div className="w-full flex justify-between text-left border dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300 bg-red-50 border-red-100 text-red-500 text-sm rounded-lg p-4">
            <p className="items-center">
              <WarningIcon className="w-5 h-5 fill-current mx-1 inline-flex" />
              This token is reported to have been spammed to many users. Please
              exercise caution when interacting with it. Click
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
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl">
              <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                Overview
              </h2>

              <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Total Supply:
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {token?.tokens ? localFormat(token?.tokens) : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Transfers:
                  </div>
                  {txnLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {transfers && token ? localFormat(transfers) : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Holders:</div>
                  {holderLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      <div className="flex items-center">
                        {holders ? localFormat(holders) : ''}
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
                                    nanoToMilli(status.timestamp),
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
              <div className="px-3 divide-y  dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Contract:</div>
                  {isLoading ? (
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full text-green-500 dark:text-green-250 md:w-3/4 break-words">
                      <Link
                        href={`/address/${token?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green-500 dark:text-green-250 hover:no-underline">
                          {token?.contract}
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Official Site:
                  </div>
                  <div className="w-full md:w-3/4 text-green-500 dark:text-green-250 break-words">
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <Link
                        href={`${token?.website}`}
                        className="hover:no-underline"
                      >
                        {token?.website}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Social Profiles:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {/* corrections needed */}
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
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
            <div>
              {tabs &&
                tabs?.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => onTab(index)}
                    className={`  text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                      pageTab === tab
                        ? 'rounded-lg bg-green-600 dark:bg-green-250  text-white'
                        : 'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 rounded-lg hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10'
                    }`}
                    value={tab}
                  >
                    <h2>{tab}</h2>
                  </button>
                ))}
            </div>
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className={`${pageTab === 'Transfers' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.NFT.Transfers`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Holders' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.NFT.Holders`}
                    props={{
                      network: network,
                      id: id,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Inventory' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.NFT.Inventory`}
                    props={{
                      network: network,
                      id: id,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Comments' ? '' : 'hidden'} `}>
                <div className="py-3">
                  {
                    <Widget
                      src={`${ownerId}/widget/bos-components.components.Comments.Feed`}
                      props={{
                        network: network,
                        path: `nearblocks.io/nft/${id}`,
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
