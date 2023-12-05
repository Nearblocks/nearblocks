/**
 * Component : Accounts
 * Author: Nearblocks Pte Ltd
 * License : Business Source License 1.1
 * Description: Accounts component enable users to view information related to their accounts.
 * @interface Props
 * @param {string} [id] - The account identifier passed as a string.
 * @param {boolean} [fetchStyles] - Use Nearblock styles.
 */

interface Props {
  id?: string;
  fetchStyles?: boolean;
}

import Skelton from '@/includes/Common/Skelton';
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
} from '@/includes/types';

export default function (props: Props) {
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<SatsInfo>({} as SatsInfo);
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
  const [css, setCss] = useState({});

  /**
   * Fetches styles asynchronously from a nearblocks gateway.
   */
  function fetchStyles() {
    asyncFetch('https://beta.nearblocks.io/common.css').then(
      (res: { body: string }) => {
        if (res?.body) {
          setCss(res.body);
        }
      },
    );
  }

  const config = getConfig(context.networkId);

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
        .catch(() => {});
    }

    function fetchAccountData() {
      asyncFetch(`${config?.backendUrl}account/${props.id}`, {
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
        .catch(() => {});
    }

    function fetchContractData() {
      asyncFetch(
        `${config?.backendUrl}account/${props.id}/contract/deployments`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then(
          (data: {
            body: {
              deployments: DeploymentsInfo[];
            };
          }) => {
            const depResp = data?.body?.deployments?.[0];
            setDeploymentData({
              block_timestamp: depResp.block_timestamp,
              receipt_predecessor_account_id:
                depResp.receipt_predecessor_account_id,
              transaction_hash: depResp.transaction_hash,
            });
          },
        )
        .catch(() => {});
    }

    function fetchTokenData() {
      asyncFetch(`${config?.backendUrl}fts/${props.id}`, {
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
      asyncFetch(`${config?.backendUrl}account/${props.id}/inventory`, {
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
        .catch(() => {});
    }

    fetchStatsData();
    fetchAccountData();
    fetchContractData();
    fetchTokenData();
    fetchInventoryData();
  }, [config?.backendUrl, props.id]);

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
              result: { result: number[] };
            };
          }) => {
            const resp = data?.body?.result;
            return decodeArgs(resp.result);
          },
        )
        .catch(() => {});
    }

    function loadBalances() {
      const fts = inventoryData.fts;
      if (!fts?.length) {
        if (fts?.length === 0) setLoading(false);
        return;
      }

      let total = Big(0);

      const tokens: TokenListInfo[] = [];

      const pricedTokens: TokenListInfo[] = [];

      Promise.all(
        fts.map((ft: FtsInfo) => {
          return ftBalanceOf(ft.contract, props.id).then((rslt: string) => {
            return { ...ft, amount: rslt };
          });
        }),
      ).then((results: FtsInfo[]) => {
        results.forEach((rslt: FtsInfo) => {
          const ftrslt = rslt;
          const amount = rslt?.amount;

          let sum = Big(0);

          let rpcAmount = Big(0);

          if (amount) {
            rpcAmount = Big(amount).div(Big(10).pow(ftrslt.ft_meta?.decimals));
          }

          if (ftrslt.ft_meta?.price) {
            sum = rpcAmount.mul(Big(ftrslt.ft_meta?.price));
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

        setLoading(false);
      });
    }

    loadBalances();
  }, [inventoryData?.fts, props.id, config?.rpcUrl]);

  useEffect(() => {
    if (props?.fetchStyles) fetchStyles();
  }, [props?.fetchStyles]);

  const Theme = styled.div`
    ${css}
  `;

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
              keys: resp.keys,
              hash: resp.hash,
            });
          },
        )
        .catch(() => {});
    }

    function loadSchema() {
      if (!props.id) return;

      Promise.all([contractCode(props.id), viewAccessKeys(props.id)]);
    }
    loadSchema();
  }, [props.id, config?.rpcUrl]);

  if (code?.code_base64) {
    const locked = (key.keys || []).every(
      (key: {
        access_key: {
          nonce: number;
          permission: string;
        };
        public_key: string;
      }) => key.access_key.permission !== 'FullAccess',
    );

    setContract({ ...code, locked });
  }
  return (
    <Theme>
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between flex-wrap pt-4">
          {!props.id ? (
            <Skelton />
          ) : (
            <h1 className="flex items-center justify-between break-all space-x-2 text-xl text-gray-700 leading-8 px-2">
              Near Account: @&nbsp;{' '}
              {props?.id && (
                <span className="font-semibold text-green-500 ">
                  {' '}
                  {'  ' + props.id}
                </span>
              )}
              {
                <Widget
                  src={`${config.ownerId}/widget/bos-components.components.Shared.Buttons`}
                  props={{
                    id: props.id,
                    config: config,
                  }}
                />
              }
            </h1>
          )}
          {
            <Widget
              src={`${config.ownerId}/widget/bos-components.components.Shared.SponsoredBox`}
            />
          }
        </div>
        <div className="text-gray-500 px-2 pt-1 border-t">
          {
            <Widget
              src={`${config.ownerId}/widget/bos-components.components.Shared.SponsoredText`}
              props={{
                textColor: false,
              }}
            />
          }
        </div>

        <div className="flex gap-2 mb-2 md:mb-2 mt-10">
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-lg">
              <div className="flex justify-between border-b p-3 text-gray-600">
                <h2 className="leading-6 text-sm font-semibold">Overview</h2>
                {tokenData?.name && (
                  <div className="flex items-center text-xs bg-gray-100 rounded-md px-2 py-1">
                    <div className="truncate max-w-[110px]">
                      {tokenData.name}
                    </div>
                    {tokenData.website && (
                      <a
                        href={tokenData.website}
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

              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">Balance:</div>
                  {loading ? (
                    <Skelton />
                  ) : (
                    <div className="w-full md:w-3/4">
                      {yoctoToNear(accountData?.amount || 0, true)} Ⓝ
                    </div>
                  )}
                </div>
                {context.networkId === 'mainnet' && statsData?.near_price && (
                  <div className="flex py-4 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">Value</div>
                    {loading ? (
                      <Skelton />
                    ) : (
                      <div className="w-full md:w-3/4 break-words">
                        $
                        {fiatValue(
                          yoctoToNear(accountData.amount || 0, false),
                          statsData.near_price,
                        )}{' '}
                        <span className="text-xs">
                          (@ ${dollarFormat(statsData.near_price)} / Ⓝ)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex py-4 text-sm text-gray-600">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">Tokens:</div>
                  <div className="w-full md:w-3/4 break-words -my-1">
                    <TokenHoldings
                      data={inventoryData}
                      loading={loading}
                      ft={ft}
                      id={props.id}
                      appUrl={config.appUrl}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-lg overflow-hidden">
              <h2 className="leading-6 border-b p-3 text-gray-600 text-sm font-semibold">
                Account information
              </h2>

              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex justify-between">
                  <div className="flex xl:flex-nowrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">Staked Balance:</div>
                    {loading ? (
                      <div className="w-full mb-2 break-words">
                        <Skelton className="" />
                      </div>
                    ) : (
                      <div className="w-full mb-2 break-words">
                        {yoctoToNear(Number(accountData?.locked || 0), true)} Ⓝ
                      </div>
                    )}
                  </div>
                  <div className="flex ml-4 xl:flex-nowrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">Storage Used:</div>
                    {loading ? (
                      <div className="w-full mb-2 break-words">
                        <Skelton className="" />
                      </div>
                    ) : (
                      <div className="w-full break-words xl:mt-0 mb-2">
                        {weight(Number(accountData?.storage_usage) || 0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex xl:flex-nowrap items-center justify-between py-4 w-full">
                    {loading ? (
                      <div className="w-full mb-2 md:mb-0">
                        <Skelton className="" />
                      </div>
                    ) : (
                      <div className="w-full mb-2 md:mb-0">
                        {accountData?.deleted?.transaction_hash
                          ? 'Deleted At:'
                          : 'Created At:'}
                      </div>
                    )}
                    {loading ? (
                      <div className="w-full mb-2 break-words">
                        <Skelton className="" />
                      </div>
                    ) : (
                      <div className="w-full mb-2 break-words">
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
                    <div className="flex ml-4 xl:flex-nowrap items-center justify-between py-4 w-full">
                      <div className="w-full mb-2">Contract Locked:</div>
                      <div className="w-full mb-2 break-words">
                        {contract?.locked ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex ml-4 xl:flex-nowrap items-center justify-between py-4 w-full" />
                  )}
                </div>
                {deploymentData?.receipt_predecessor_account_id && (
                  <div className="flex items-center py-4">
                    <div className="md:w-1/4 mb-2 md:mb-0 ">
                      Contract Creator:
                    </div>
                    <div className="ml-10 mb-2 md:w-3/4">
                      <a
                        href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                      >
                        <a className="text-green-500">
                          {shortenAddress(
                            deploymentData.receipt_predecessor_account_id,
                          )}
                        </a>
                      </a>
                      {' at txn  '}
                      <a href={`/txns/${deploymentData.transaction_hash}`}>
                        <a className="text-green-500">
                          {shortenAddress(deploymentData.transaction_hash)}
                        </a>
                      </a>
                    </div>
                  </div>
                )}
                {tokenData?.name && (
                  <div className="flex flex-wrap items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Token Tracker:
                    </div>
                    <div className="w-full md:w-3/4 mb-2 break-words">
                      <div className="flex items-center">
                        <TokenImage
                          src={tokenData?.icon}
                          alt={tokenData?.name}
                          appUrl={config.appUrl}
                          className="w-4 h-4 mr-2"
                        />
                        <a href={`/token/${props.id}`}>
                          <a className="flex text-green-500">
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
                          <div className="text-gray-500 ml-1">
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
      </div>
    </Theme>
  );
}
