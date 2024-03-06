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
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  id?: string;
  requestSignInWithWallet: (id: string) => void;
  signedIn: boolean;
  accountId: string;
  logOut: () => void;
}

import FaExternalLinkAlt from '@/includes/icons/FaExternalLinkAlt';
import {
  yoctoToNear,
  fiatValue,
  nanoToMilli,
  shortenAddress,
  getConfig,
} from '@/includes/libs';
import {
  dollarFormat,
  localFormat,
  weight,
  convertToUTC,
} from '@/includes/formats';
import TokenImage from '@/includes/icons/TokenImage';
import TokenHoldings from '@/includes/Common/TokenHoldings';
import { encodeArgs, decodeArgs } from '@/includes/near';
import {
  SatsInfo,
  AccountInfo,
  DeploymentsInfo,
  TokenInfo,
  InventoryInfo,
  FtsInfo,
  ContractCodeInfo,
  AccessKeyInfo,
  ContractInfo,
  FtInfo,
  TokenListInfo,
  ContractParseInfo,
  SchemaInfo,
} from '@/includes/types';
import Skeleton from '@/includes/Common/Skeleton';

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
  } = props;
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
  const [inventoryData, setInventoryData] = useState<InventoryInfo>(
    {} as InventoryInfo,
  );
  const [contract, setContract] = useState<ContractInfo>({} as ContractInfo);
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const [code, setCode] = useState<ContractCodeInfo>({} as ContractCodeInfo);
  const [key, setKey] = useState<AccessKeyInfo>({} as AccessKeyInfo);
  const [schema, setSchema] = useState<SchemaInfo>({} as SchemaInfo);
  const [contractInfo, setContractInfo] = useState<ContractParseInfo>(
    {} as ContractParseInfo,
  );

  const config = getConfig(network);

  const onTab = (index: number) => {
    setPageTab(tabs[index]);
    onFilterClear('');
  };

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
          }) => {
            const statsResp = data?.body?.stats?.[0];
            setStatsData({ near_price: statsResp.near_price });
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
          }) => {
            const accountResp = data?.body?.account?.[0];
            setAccountData({
              account_id: accountResp.account_id,
              amount: accountResp.amount,
              code_hash: accountResp.code_hash,
              created: accountResp.created,
              deleted: accountResp.deleted,
              locked: accountResp.locked,
              storage_usage: accountResp.storage_usage,
            });
          },
        )
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
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
          }) => {
            const depResp = data?.body?.deployments?.[0];
            setDeploymentData(depResp);
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
          }) => {
            const tokenResp = data?.body?.contracts?.[0];
            setTokenData({
              name: tokenResp.name,
              icon: tokenResp.icon,
              symbol: tokenResp.symbol,
              price: tokenResp.price,
              website: tokenResp.website,
            });
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
          }) => {
            const response = data?.body?.inventory;
            setInventoryData({
              fts: response.fts,
              nfts: response.nfts,
            });
          },
        )
        .catch(() => {})
        .finally(() => {
          setInventoryLoading(false);
        });
    }

    fetchStatsData();
    fetchAccountData();
    fetchContractData();
    fetchTokenData();
    fetchInventoryData();
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
          const amount = rslt?.amount ?? 0;

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
  }, [inventoryData?.fts, id, config?.rpcUrl]);

  useEffect(() => {
    function contractCode(address: string) {
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
            };
          }) => {
            const resp = res?.body?.result;
            setCode({
              block_hash: resp.block_hash,
              block_height: resp.block_height,
              code_base64: resp.code_base64,
              hash: resp.hash,
            });
          },
        )
        .catch(() => {});
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
          }) => {
            const resp = res?.body?.result;
            setKey({
              block_hash: resp.block_hash,
              block_height: resp.block_height,
              keys: resp?.keys,
              hash: resp?.hash,
            });
          },
        )
        .catch(() => {});
    }

    function loadSchema() {
      if (!id) return;

      Promise.all([contractCode(id), viewAccessKeys(id)]);
    }
    loadSchema();
  }, [id, config?.rpcUrl]);

  useEffect(() => {
    if (code?.code_base64) {
      const locked = (key.keys || []).every(
        (key: {
          access_key: {
            nonce: string;
            permission: string;
          };
          public_key: string;
        }) => key.access_key.permission !== 'FullAccess',
      );

      function fetchContractInfo() {
        asyncFetch(`${config?.backendUrl}account/${id}/contract/parse`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(
            (res: {
              body: {
                contract: { contract: ContractParseInfo; schema: SchemaInfo }[];
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

      fetchContractInfo();

      setContract({ ...code, locked });
    }
  }, [code, key, config?.backendUrl, id]);

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

  return (
    <>
      <div className="flex items-center justify-between flex-wrap pt-4 ">
        {!id ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="py-4 flex items-center justify-between break-all space-x-2 text-xl text-gray-700 leading-8 px-2">
            Near Account: @&nbsp;{' '}
            {id && (
              <span className="font-semibold text-green-500 ">{'  ' + id}</span>
            )}
            {
              <Widget
                src={`${config?.ownerId}/widget/bos-components.components.Shared.Buttons`}
                props={{
                  id: id,
                  config: config,
                }}
              />
            }
          </h1>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <div className="h-full bg-white soft-shadow rounded-xl">
            <div className="flex justify-between border-b p-3 text-nearblue-600">
              <h2 className="leading-6 text-sm font-semibold">
                {t ? t('address:overview') : 'Overview'}
              </h2>
              {tokenData?.name && (
                <div className="flex items-center text-xs bg-gray-100 rounded-md px-2 py-1">
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
            <div className="px-3 divide-y text-sm text-nearblue-600">
              <div className="flex flex-wrap py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('address:balance') : 'Balance'}:
                </div>
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {accountData?.amount
                      ? yoctoToNear(accountData?.amount, true)
                      : accountData?.amount ?? ''}{' '}
                    Ⓝ
                  </div>
                )}
              </div>
              {network === 'mainnet' && statsData?.near_price && (
                <div className="flex flex-wrap py-4 text-sm text-nearblue-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    {t ? t('address:value') : 'Value:'}
                  </div>
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {accountData?.amount && statsData?.near_price
                        ? '$' +
                          fiatValue(
                            yoctoToNear(accountData?.amount, false),
                            statsData?.near_price,
                          )
                        : ''}{' '}
                      <span className="text-xs">
                        (@ $
                        {statsData?.near_price
                          ? dollarFormat(statsData?.near_price)
                          : statsData?.near_price ?? ''}{' '}
                        / Ⓝ)
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap py-4 text-sm text-nearblue-600">
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <h2 className="leading-6 border-b p-3 text-nearblue-600 text-sm font-semibold">
              {t ? t('address:moreInfo') : 'Account information'}
            </h2>
            <div className="px-3 divide-y text-sm text-nearblue-600">
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
                  <div className="w-full mb-2 md:mb-0">Storage Used:</div>
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
                      {accountData?.deleted?.transaction_hash
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
                      {accountData?.deleted?.transaction_hash
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
                {contract?.hash ? (
                  <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">Contract Locked:</div>
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {contract?.locked ? 'Yes' : 'No'}
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
                    <a
                      href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 hover:no-underline">
                        {shortenAddress(
                          deploymentData.receipt_predecessor_account_id ?? '',
                        )}
                      </a>
                    </a>
                    {' at txn  '}
                    <a
                      href={`/txns/${deploymentData.transaction_hash}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 hover:no-underline">
                        {shortenAddress(deploymentData.transaction_hash ?? '')}
                      </a>
                    </a>
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
                      <a href={`/token/${id}`} className="hover:no-underline">
                        <a className="flex text-green-500 hover:no-underline">
                          <span className="inline-block truncate max-w-[110px] mr-1">
                            {tokenData.name}
                          </span>
                          (
                          <span className="inline-block truncate max-w-[80px]">
                            {tokenData.symbol}
                          </span>
                          )
                        </a>
                      </a>
                      {tokenData.price && (
                        <div className="text-nearblue-600 ml-1">
                          (@ ${localFormat(tokenData.price)})
                        </div>
                      )}
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
          <Tabs.Root defaultValue={pageTab}>
            <Tabs.List>
              {tabs &&
                tabs.map((tab, index) => {
                  if (
                    tab === 'Contract' &&
                    !(contractInfo?.methodNames?.length > 0)
                  ) {
                    return null;
                  }
                  return (
                    <Tabs.Trigger
                      key={index}
                      onClick={() => {
                        onTab(index);
                      }}
                      className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                        pageTab === tab
                          ? 'rounded-lg bg-green-600 text-white'
                          : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600'
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
                          <div className="absolute text-white bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-3 px-1 ">
                            NEW
                          </div>
                        </div>
                      ) : tab === 'Comments' ? (
                        <h2>{t ? t('address:comments') : tab}</h2>
                      ) : (
                        <h2>{tab}</h2>
                      )}
                    </Tabs.Trigger>
                  );
                })}
            </Tabs.List>
            <div>
              <Tabs.Content value={tabs[0]}>
                {
                  <Widget
                    src={`${config?.ownerId}/widget/bos-components.components.Address.Transactions`}
                    props={{
                      network: network,
                      t: t,
                      id: id,
                      filters: filters,
                      handleFilter: handleFilter,
                      onFilterClear: onFilterClear,
                    }}
                  />
                }
              </Tabs.Content>
              <Tabs.Content value={tabs[1]}>
                {
                  <Widget
                    src={`${config?.ownerId}/widget/bos-components.components.Address.TokenTransactions`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      filters: filters,
                      handleFilter: handleFilter,
                      onFilterClear: onFilterClear,
                    }}
                  />
                }
              </Tabs.Content>
              <Tabs.Content value={tabs[2]}>
                {
                  <Widget
                    src={`${config?.ownerId}/widget/bos-components.components.Address.NFTTransactions`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                      filters: filters,
                      handleFilter: handleFilter,
                      onFilterClear: onFilterClear,
                    }}
                  />
                }
              </Tabs.Content>
              <Tabs.Content value={tabs[3]}>
                {
                  <Widget
                    src={`${config?.ownerId}/widget/bos-components.components.Address.AccessKeys`}
                    props={{
                      network: network,
                      id: id,
                      t: t,
                    }}
                  />
                }
              </Tabs.Content>
              {contractInfo && contractInfo?.methodNames?.length > 0 && (
                <Tabs.Content value={tabs[4]}>
                  {
                    <Widget
                      src={`${config.ownerId}/widget/bos-components.components.Contract.Overview`}
                      props={{
                        network: network,
                        t: t,
                        id: id,
                        contract: contract,
                        schema: schema,
                        contractInfo: contractInfo,
                        requestSignInWithWallet: requestSignInWithWallet,
                        connected: signedIn,
                        accountId: accountId,
                        logOut: logOut,
                      }}
                    />
                  }
                </Tabs.Content>
              )}
              <Tabs.Content value={tabs[5]}>
                <div className="bg-white soft-shadow rounded-xl pb-1">
                  <div className="py-3">
                    {
                      <Widget
                        src={`${config.ownerId}/widget/bos-components.components.Comments.Feed`}
                        props={{
                          network: network,
                          path: `nearblocks.io/address/${id}`,
                          limit: 10,
                        }}
                      />
                    }
                  </div>
                </div>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </div>
    </>
  );
}
