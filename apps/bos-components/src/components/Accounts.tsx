/**
 * Component: Accounts
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Accounts component enable users to view information related to their accounts.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The account identifier passed as a string.
 * @param {Function} [requestSignInWithWallet] - Function to initiate sign-in with a wallet.
 * @param {boolean} [signedIn] - Boolean indicating whether the user is currently signed in or not.
 * @param {string} [accountId] - The account ID of the signed-in user, passed as a string.
 * @param {Function} [logOut] - Function to log out.
 * @param {string} ownerId - The identifier of the owner of the component.
 * @param {Function} handleToggle - Function to toggle between showing all and unique receipts.
 * @param {boolean} showAllReceipts - Boolean indicating whether to show all receipts or not.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  id?: string;
  requestSignInWithWallet: (id: string) => void;
  signedIn: boolean;
  accountId: string;
  ownerId: string;
  logOut: () => void;
  handleToggle: () => void;
  showAllReceipts: boolean;
  userApiUrl: string;
}

import FaExternalLinkAlt from '@/includes/icons/FaExternalLinkAlt';
import TokenImage from '@/includes/icons/TokenImage';
import TokenHoldings from '@/includes/Common/TokenHoldings';
import {
  SatsInfo,
  AccountInfo,
  DeploymentsInfo,
  TokenInfo,
  InventoryInfo,
  FtsInfo,
  ContractCodeInfo,
  AccessKeyInfo,
  FtInfo,
  TokenListInfo,
  ContractParseInfo,
  SchemaInfo,
  SpamToken,
  AccountDataInfo,
} from '@/includes/types';
import Skeleton from '@/includes/Common/Skeleton';
import WarningIcon from '@/includes/icons/WarningIcon';

const tabs = [
  'Transactions',
  'Token Txns',
  'NFT Token Txns',
  'Access Keys',
  'Contract',
  'Comments',
];

export default function (props: Props) {
  const {
    network,
    t,
    id,
    requestSignInWithWallet,
    signedIn,
    accountId,
    logOut,
    ownerId,
    handleToggle,
    showAllReceipts,
    userApiUrl,
  } = props;

  const { dollarFormat, localFormat, weight, convertToUTC } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const {
    yoctoToNear,
    fiatValue,
    nanoToMilli,
    shortenAddress,
    getConfig,
    handleRateLimit,
    fetchData,
  } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const { encodeArgs, decodeArgs } = VM.require(
    `${ownerId}/widget/includes.Utils.near`,
  );

  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [statsData, setStatsData] = useState<SatsInfo>({} as SatsInfo);
  const [pageTab, setPageTab] = useState('Transactions');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [accountData, setAccountData] = useState<AccountInfo>(
    {} as AccountInfo,
  );
  const [deploymentData, setDeploymentData] = useState<DeploymentsInfo>(
    {} as DeploymentsInfo,
  );
  const [tokenData, setTokenData] = useState<TokenInfo>({} as TokenInfo);
  const [nftTokenData, setNftTokenData] = useState<TokenInfo>({} as TokenInfo);
  const [inventoryData, setInventoryData] = useState<InventoryInfo>(
    {} as InventoryInfo,
  );
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const [isLocked, setIsLocked] = useState(false);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaInfo>({} as SchemaInfo);
  const [contractInfo, setContractInfo] = useState<ContractParseInfo>(
    {} as ContractParseInfo,
  );
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [spamTokens, setSpamTokens] = useState<SpamToken>({ blacklist: [] });

  const config = getConfig && getConfig(network);

  const onTab = (index: number) => {
    setPageTab(tabs[index]);
    onFilterClear('');
  };

  useEffect(() => {
    function contractCode(address: string) {
      setIsContractLoading(true);
      asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_code',
            finality: 'final',
            account_id: address,
            prefix_base64: '',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res: {
            body: {
              result: ContractCodeInfo;
              error?: any;
            };
            status: number;
          }) => {
            const resp = res?.body?.result;
            if (res.status === 200 && resp) {
              if (resp?.code_base64) {
                setContract({
                  block_hash: resp.block_hash,
                  block_height: resp.block_height,
                  code_base64: resp.code_base64,
                  hash: resp.hash,
                });
                asyncFetch(
                  `${config?.backendUrl}account/${id}/contract/parse`,
                  {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  },
                )
                  .then(
                    (res: {
                      body: {
                        contract: {
                          contract: ContractParseInfo;
                          schema: SchemaInfo;
                        }[];
                      };
                      status: number;
                    }) => {
                      const resp = res.body.contract;
                      if (res.status === 200 && resp && resp.length > 0) {
                        const [{ contract, schema }] = resp;
                        setContractInfo(contract);
                        setSchema(schema);
                      }
                    },
                  )
                  .catch(() => {});
              }
              setIsContractLoading(false);
            } else if (res?.status === 200 && res?.body?.error) {
              setIsContractLoading(false);
            }
          },
        )
        .catch(() => {
          setIsContractLoading(false);
        });
    }

    function viewAccessKeys(address: string) {
      asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_access_key_list',
            finality: 'final',
            account_id: address,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res: {
            body: {
              result: AccessKeyInfo;
            };
            status: number;
          }) => {
            const resp = res?.body?.result;
            if (res.status === 200 && resp) {
              const locked = (resp.keys || []).every(
                (key: {
                  access_key: {
                    nonce: string;
                    permission: string;
                  };
                  public_key: string;
                }) => key.access_key.permission !== 'FullAccess',
              );
              setIsLocked(locked);
            }
          },
        )
        .catch(() => {});
    }

    function viewAccount(address: string) {
      setIsAccountLoading(true);
      asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: address,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res: {
            body: {
              result: AccountDataInfo;
              error?: any;
            };
            status: number;
          }) => {
            const resp = res?.body?.result;
            if (res.status === 200 && resp) {
              setAccountView(resp);
              setIsAccountLoading(false);
            } else if (res?.status === 200 && res?.body?.error) {
              setIsAccountLoading(false);
            }
          },
        )
        .catch(() => {
          setIsAccountLoading(false);
        });
    }

    function loadSchema() {
      if (!id) return;

      Promise.all([contractCode(id), viewAccessKeys(id), viewAccount(id)]);
    }

    loadSchema();
  }, [id, config?.rpcUrl, config?.backendUrl]);

  useEffect(() => {
    function fetchStatsData() {
      asyncFetch(`${config?.backendUrl}stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              stats: SatsInfo[];
            };
            status: number;
          }) => {
            const statsResp = data?.body?.stats?.[0];
            if (data.status === 200) {
              setStatsData({ near_price: statsResp.near_price });
            } else {
              handleRateLimit(data, fetchStatsData);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchAccountData() {
      setLoading(true);
      asyncFetch(`${config?.backendUrl}account/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              account: AccountInfo[];
            };
            status: number;
          }) => {
            const accountResp = data?.body?.account?.[0];
            if (data.status === 200) {
              setAccountData({
                account_id: accountResp.account_id,
                amount: accountResp.amount,
                code_hash: accountResp.code_hash,
                created: accountResp.created,
                deleted: accountResp.deleted,
                locked: accountResp.locked,
                storage_usage: accountResp.storage_usage,
              });
              setLoading(false);
            } else {
              handleRateLimit(data, fetchAccountData, () => setLoading(false));
            }
          },
        )
        .catch(() => {});
    }

    function fetchContractData() {
      asyncFetch(`${config?.backendUrl}account/${id}/contract/deployments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              deployments: DeploymentsInfo[];
            };
            status: number;
          }) => {
            const depResp = data?.body?.deployments?.[0];
            if (data.status === 200) {
              setDeploymentData(depResp);
            } else {
              handleRateLimit(data, fetchContractData);
            }
          },
        )
        .catch(() => {});
    }

    function fetchTokenData() {
      asyncFetch(`${config?.backendUrl}fts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              contracts: TokenInfo[];
            };
            status: number;
          }) => {
            const tokenResp = data?.body?.contracts?.[0];
            if (data.status === 200) {
              setTokenData({
                name: tokenResp.name,
                icon: tokenResp.icon,
                symbol: tokenResp.symbol,
                price: tokenResp.price,
                website: tokenResp.website,
              });
            } else {
              handleRateLimit(data, fetchTokenData);
            }
          },
        )
        .catch(() => {});
    }

    function fetchNftTokenData() {
      asyncFetch(`${config?.backendUrl}nfts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              contracts: TokenInfo[];
            };
            status: number;
          }) => {
            const tokenResp = data?.body?.contracts?.[0];
            if (data.status === 200) {
              setNftTokenData(tokenResp);
            } else {
              handleRateLimit(data, fetchNftTokenData);
            }
          },
        )
        .catch(() => {});
    }

    function fetchInventoryData() {
      setInventoryLoading(true);
      asyncFetch(`${config?.backendUrl}account/${id}/inventory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              inventory: InventoryInfo;
            };
            status: number;
          }) => {
            const response = data?.body?.inventory;
            if (data.status === 200) {
              setInventoryData({
                fts: response.fts,
                nfts: response.nfts,
              });
              setInventoryLoading(false);
            } else {
              handleRateLimit(data, fetchInventoryData, () =>
                setInventoryLoading(false),
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
      fetchStatsData();
      fetchAccountData();
      fetchContractData();
      fetchTokenData();
      fetchNftTokenData();
      fetchInventoryData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id]);

  useEffect(() => {
    function ftBalanceOf(contracts: string, account_id?: string) {
      return asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'call_function',
            finality: 'final',
            account_id: contracts,
            method_name: 'ft_balance_of',
            args_base64: encodeArgs({ account_id }),
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res: {
            body: {
              result: { result: number[] };
            };
          }) => {
            return res;
          },
        )
        .then(
          (data: {
            body: {
              result: { result: string[] };
            };
          }) => {
            const resp = data?.body?.result;
            return decodeArgs(resp.result);
          },
        )
        .catch(() => {});
    }
    function loadBalances() {
      const fts = inventoryData?.fts;
      if (!fts?.length) {
        if (fts?.length === 0) setIsLoading(false);
        return;
      }

      let total = Big(0);

      const tokens: TokenListInfo[] = [];

      const pricedTokens: TokenListInfo[] = [];

      Promise.all(
        fts.map((ft: FtsInfo) => {
          return ftBalanceOf(ft?.contract, id).then((rslt: string) => {
            return { ...ft, amount: rslt };
          });
        }),
      ).then((results: TokenListInfo[]) => {
        results.forEach((rslt: TokenListInfo) => {
          const ftrslt = rslt;
          const amount = typeof rslt?.amount === 'string' ? rslt.amount : 0;

          let sum = Big(0);

          let rpcAmount = Big(0);

          if (amount) {
            rpcAmount = ftrslt?.ft_meta?.decimals
              ? Big(amount).div(Big(10).pow(ftrslt.ft_meta.decimals))
              : 0;
          }
          if (ftrslt?.ft_meta?.price) {
            sum = rpcAmount.mul(Big(ftrslt?.ft_meta?.price));
            total = total.add(sum);

            return pricedTokens.push({
              ...ftrslt,
              amountUsd: sum.toString(),
              rpcAmount: rpcAmount.toString(),
            });
          }

          return tokens.push({
            ...ftrslt,
            amountUsd: sum.toString(),
            rpcAmount: rpcAmount.toString(),
          });
        });

        tokens.sort((a, b) => {
          const first = Big(a.rpcAmount);

          const second = Big(b.rpcAmount);

          if (first.lt(second)) return 1;
          if (first.gt(second)) return -1;

          return 0;
        });

        pricedTokens.sort((a, b) => {
          const first = Big(a.amountUsd);

          const second = Big(b.amountUsd);

          if (first.lt(second)) return 1;
          if (first.gt(second)) return -1;

          return 0;
        });

        setFT({
          amount: total.toString(),
          tokens: [...pricedTokens, ...tokens],
        });

        setIsLoading(false);
      });
    }

    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, id, config?.rpcUrl]);

  const handleFilter = (name: string, value: string) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
  };

  const onFilterClear = (name: string) => {
    let updatedFilters = { ...filters };
    if (updatedFilters.hasOwnProperty(name)) {
      delete updatedFilters[name];
      setFilters(updatedFilters);
    } else {
      updatedFilters = {};
      setFilters(updatedFilters);
    }
  };

  const balance = accountData?.amount ?? '';
  const nearPrice = statsData?.near_price ?? '';

  return (
    <>
      {accountView === null &&
        accountData?.deleted?.transaction_hash &&
        !isAccountLoading && (
          <>
            <div className="block lg:flex lg:space-x-2">
              <div className="w-full ">
                <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
                  <p className="mb-0 items-center break-words">
                    <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                    {`This account was deleted on ${
                      accountData?.deleted?.transaction_hash
                        ? convertToUTC(
                            nanoToMilli(accountData.deleted.block_timestamp),
                            false,
                          )
                        : ''
                    }`}
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2"></div>
          </>
        )}
      {accountView !== null &&
        accountView?.block_hash !== undefined &&
        isLocked &&
        accountData &&
        accountData?.deleted?.transaction_hash === null &&
        contract === null &&
        !isContractLoading && (
          <>
            <div className="block lg:flex lg:space-x-2">
              <div className="w-full ">
                <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
                  <p className="mb-0 items-center">
                    <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                    This account has no full access keys
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2"></div>
          </>
        )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
            <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
              <h2 className="leading-6 text-sm font-semibold">
                {t ? t('address:overview') : 'Overview'}
              </h2>
              {tokenData?.name && (
                <div className="flex items-center text-xs bg-gray-100 dark:bg-black-200 dark:text-neargray-10 rounded-md px-2 py-1">
                  <div className="truncate max-w-[110px]">
                    {tokenData?.name}
                  </div>
                  {tokenData?.website && (
                    <a
                      href={tokenData?.website}
                      className="ml-1"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex flex-wrap py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('address:balance') : 'Balance'}:
                </div>
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {balance
                      ? yoctoToNear(accountData?.amount, true) + ' Ⓝ'
                      : ''}
                  </div>
                )}
              </div>
              {network === 'mainnet' &&
                accountData?.amount &&
                statsData?.near_price && (
                  <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      {t ? t('address:value') : 'Value:'}
                    </div>
                    {loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <div className="w-full md:w-3/4 break-words flex items-center">
                        <span className="px-1">
                          {accountData?.amount && statsData?.near_price
                            ? '$' +
                              fiatValue(
                                yoctoToNear(accountData?.amount, false),
                                statsData?.near_price,
                              ) +
                              ' '
                            : ''}
                        </span>
                        <span className="text-xs">
                          (@
                          {nearPrice
                            ? '$' + dollarFormat(statsData?.near_price)
                            : ''}
                          / Ⓝ)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('address:tokens') : 'Tokens:'}
                </div>
                <div className="w-full md:w-3/4 break-words -my-1 z-10">
                  <TokenHoldings
                    data={inventoryData}
                    loading={isloading}
                    inventoryLoading={inventoryLoading}
                    ft={ft}
                    id={id}
                    appUrl={config?.appUrl}
                    ownerId={ownerId}
                    spamTokens={spamTokens.blacklist}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
              {t ? t('address:moreInfo') : 'Account information'}
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex justify-between">
                <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    Staked {t ? t('address:balance') : 'Balance'}:
                  </div>
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {accountData?.locked
                        ? yoctoToNear(accountData?.locked, true) + ' Ⓝ'
                        : accountData?.locked ?? ''}
                    </div>
                  )}
                </div>
                <div className="flex ml-4  xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    {t ? t('address:storageUsed') : 'Storage Used'}:
                  </div>
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {accountData?.storage_usage
                        ? weight(accountData?.storage_usage)
                        : accountData?.storage_usage ?? ''}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  {loading ? (
                    <div className="w-full mb-2 md:mb-0">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : (
                    <div className="w-full mb-2 md:mb-0">
                      {accountView !== null &&
                      accountView?.block_hash === undefined &&
                      accountData?.deleted?.transaction_hash &&
                      !isAccountLoading
                        ? 'Deleted At:'
                        : 'Created At:'}
                    </div>
                  )}
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {accountView !== null &&
                      accountView?.block_hash === undefined &&
                      accountData?.deleted?.transaction_hash &&
                      !isAccountLoading
                        ? convertToUTC(
                            nanoToMilli(accountData.deleted.block_timestamp),
                            false,
                          )
                        : accountData?.created?.transaction_hash
                        ? convertToUTC(
                            nanoToMilli(accountData.created.block_timestamp),
                            false,
                          )
                        : accountData?.code_hash
                        ? 'Genesis'
                        : 'N/A'}
                    </div>
                  )}
                </div>
                {contract && contract?.hash && !loading ? (
                  <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">Contract Locked:</div>
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
                    </div>
                  </div>
                ) : (
                  <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full" />
                )}
              </div>
              {deploymentData?.receipt_predecessor_account_id && (
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    Contract Creator:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <Link
                      href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 dark:text-green-250 hover:no-underline">
                        {shortenAddress(
                          deploymentData.receipt_predecessor_account_id ?? '',
                        )}
                      </a>
                    </Link>
                    {' at txn  '}
                    <Link
                      href={`/txns/${deploymentData.transaction_hash}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 dark:text-green-250 hover:no-underline">
                        {shortenAddress(deploymentData.transaction_hash ?? '')}
                      </a>
                    </Link>
                  </div>
                </div>
              )}
              {tokenData?.name && (
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    Token Tracker:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <div className="flex items-center">
                      <TokenImage
                        src={tokenData?.icon}
                        alt={tokenData?.name}
                        appUrl={config.appUrl}
                        className="w-4 h-4 mr-2"
                      />
                      <Link
                        href={`/token/${id}`}
                        className="hover:no-underline"
                      >
                        <a className="flex text-green-500 dark:text-green-250 hover:no-underline">
                          <span className="inline-block truncate max-w-[110px] mr-1">
                            {tokenData.name}
                          </span>
                          (
                          <span className="inline-block truncate max-w-[80px]">
                            {tokenData.symbol}
                          </span>
                          )
                        </a>
                      </Link>
                      {tokenData.price && (
                        <div className="text-nearblue-600 dark:text-neargray-10 ml-1">
                          (@ ${localFormat(tokenData.price)})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {nftTokenData?.name && (
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    NFT Token Tracker:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <div className="flex items-center">
                      <TokenImage
                        src={nftTokenData?.icon}
                        alt={nftTokenData?.name}
                        appUrl={config.appUrl}
                        className="w-4 h-4 mr-2"
                      />
                      <Link
                        href={`/nft-token/${id}`}
                        className="hover:no-underline"
                      >
                        <a className="flex text-green-500 dark:text-green-250 hover:no-underline">
                          <span className="inline-block truncate max-w-[110px] mr-1">
                            {nftTokenData.name}
                          </span>
                          (
                          <span className="inline-block truncate max-w-[80px]">
                            {nftTokenData.symbol}
                          </span>
                          )
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <>
            <div>
              {tabs &&
                tabs.map((tab, index) => {
                  if (
                    tab === 'Contract' &&
                    !(contractInfo?.methodNames?.length > 0)
                  ) {
                    return null;
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        onTab(index);
                      }}
                      className={`  text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                        pageTab === tab
                          ? 'rounded-lg bg-green-600 dark:bg-green-250 text-white'
                          : 'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 rounded-lg hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10'
                      }`}
                      value={tab}
                    >
                      {tab === 'Transactions' ? (
                        <h2>{t ? t('address:txns') : tab}</h2>
                      ) : tab === 'Token Txns' ? (
                        <h2>{t ? t('address:tokenTxns') : tab}</h2>
                      ) : tab === 'Contract' ? (
                        <div className="flex h-full">
                          <h2>{tab}</h2>
                          <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-3 px-1 ">
                            NEW
                          </div>
                        </div>
                      ) : tab === 'Comments' ? (
                        <h2>{t ? t('address:comments') : tab}</h2>
                      ) : tab === 'NFT Token Txns' ? (
                        <h2>{t ? t('address:nftTokenTxns') : tab}</h2>
                      ) : tab === 'Access Keys' ? (
                        <h2>{t ? t('address:accessKeys') : tab}</h2>
                      ) : (
                        <h2>{tab}</h2>
                      )}
                    </button>
                  );
                })}
            </div>
            <div>
              <div className={`${pageTab === 'Transactions' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Address.Transactions`}
                    props={{
                      network: network,
                      t: t,
                      id: id,
                      filters: filters,
                      handleFilter: handleFilter,
                      onFilterClear: onFilterClear,
                      ownerId,
                      handleToggle,
                      showAllReceipts,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Token Txns' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Address.TokenTransactions`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      filters: filters,
                      handleFilter: handleFilter,
                      onFilterClear: onFilterClear,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div
                className={`${pageTab === 'NFT Token Txns' ? '' : 'hidden'} `}
              >
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Address.NFTTransactions`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      filters: filters,
                      handleFilter: handleFilter,
                      onFilterClear: onFilterClear,
                      ownerId,
                    }}
                  />
                }
              </div>
              <div className={`${pageTab === 'Access Keys' ? '' : 'hidden'} `}>
                {
                  <Widget
                    src={`${ownerId}/widget/bos-components.components.Address.AccessKeys`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      ownerId,
                    }}
                  />
                }
              </div>
              {contractInfo && contractInfo?.methodNames?.length > 0 && (
                <>
                  <div className={`${pageTab === 'Contract' ? '' : 'hidden'} `}>
                    {
                      <Widget
                        src={`${ownerId}/widget/bos-components.components.Contract.Overview`}
                        props={{
                          network: network,
                          t: t,
                          id: id,
                          contract: contract,
                          isLocked: isLocked,
                          schema: schema,
                          contractInfo: contractInfo,
                          requestSignInWithWallet: requestSignInWithWallet,
                          connected: signedIn,
                          accountId: accountId,
                          logOut: logOut,
                          ownerId,
                        }}
                      />
                    }
                  </div>
                </>
              )}
              <div className={`${pageTab === 'Comments' ? '' : 'hidden'} `}>
                {
                  <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                    <div className="py-3">
                      <Widget
                        src={`${ownerId}/widget/bos-components.components.Comments.Feed`}
                        props={{
                          network: network,
                          path: `nearblocks.io/address/${id}`,
                          ownerId,
                          limit: 10,
                          requestSignInWithWallet,
                        }}
                      />
                    </div>
                  </div>
                }
              </div>
            </div>
          </>
        </div>
      </div>
      <div className="mb-10">
        {
          <Widget
            src={`${ownerId}/widget/includes.Common.Banner`}
            props={{ type: 'center', userApiUrl: userApiUrl }}
          />
        }
      </div>
    </>
  );
}
