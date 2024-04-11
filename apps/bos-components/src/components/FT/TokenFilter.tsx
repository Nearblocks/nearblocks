/**
 * Component: FTTokenFilter
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Fungible Token Filter on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 * @param {string} [tokenFilter] - The token filter identifier passed as a string
 * @param {string} ownerId - The identifier of the owner of the component.
 */

import Skeleton from '@/includes/Common/Skeleton';
import FaAddressBook from '@/includes/icons/FaAddressBook';
import {
  FtInfo,
  FtsInfo,
  InventoryInfo,
  TokenListInfo,
} from '@/includes/types';

interface Props {
  ownerId: string;
  network: string;
  id: string;
  tokenFilter?: string;
}

export default function ({ network, id, tokenFilter, ownerId }: Props) {
  const { dollarFormat, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.format`,
  );

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const { decodeArgs, encodeArgs } = VM.require(
    `${ownerId}/widget/includes.Utils.near`,
  );

  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState<InventoryInfo>(
    {} as InventoryInfo,
  );

  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchInventoryData() {
      setInventoryLoading(true);
      asyncFetch(`${config?.backendUrl}account/${tokenFilter}/inventory`, {
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
              setInventoryData(response);
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
    if (config?.backendUrl) {
      fetchInventoryData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.backendUrl, tokenFilter]);

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
            args_base64: encodeArgs ? encodeArgs({ account_id }) : '',
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
            return decodeArgs ? decodeArgs(resp.result) : '';
          },
        )
        .catch(() => {});
    }

    function loadBalances() {
      setInventoryLoading(true);
      const fts =
        inventoryData?.fts &&
        inventoryData?.fts.filter((f) => id == f.contract);

      if (!fts?.length) {
        if (fts?.length === 0) setInventoryLoading(false);
        return;
      }

      let total = Big(0);

      const tokens: TokenListInfo[] = [];

      const pricedTokens: TokenListInfo[] = [];

      Promise.all(
        fts.map((ft: FtsInfo) => {
          return ftBalanceOf(ft.contract, tokenFilter).then((rslt: string) => {
            return { ...ft, amount: rslt };
          });
        }),
      ).then((results: TokenListInfo[]) => {
        results.forEach((rslt: TokenListInfo) => {
          const ftrslt = rslt;
          const amount = rslt?.amount;

          let sum = Big(0);

          let rpcAmount = Big(0);

          if (amount) {
            rpcAmount = ftrslt.ft_meta?.decimals
              ? Big(amount).div(Big(10).pow(ftrslt.ft_meta?.decimals))
              : 0;
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

        setFT({
          amount: total.toString(),
          tokens: [...pricedTokens, ...tokens],
        });

        setInventoryLoading(false);
      });
    }

    loadBalances();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, id, tokenFilter, config?.rpcUrl]);

  const filterToken: TokenListInfo = ft?.tokens?.length
    ? ft?.tokens[0]
    : ({} as TokenListInfo);

  const ftAmount = ft?.amount ?? 0;

  return (
    <>
      {tokenFilter && (
        <div className="py-2 mb-4">
          <div className="bg-white soft-shadow rounded-xl  px-2 py-3">
            <div className="grid md:grid-cols-3 grid-cols-1 divide-y md:divide-y-0 md:divide-x">
              <div className="px-4 md:py-0 py-2">
                <div className="flex items-center">
                  <FaAddressBook />
                  <h5 className="text-xs my-1 font-bold ml-1 ">
                    FILTERED BY TOKEN HOLDER
                  </h5>
                </div>
                <h5 className="text-sm my-1 font-bold text-green-500 truncate md:max-w-[200px] lg:max-w-[310px] xl:max-w-full max-w-full inline-block">
                  <Link
                    href={`/address/${tokenFilter}`}
                    className="hover:no-underline"
                  >
                    <a className="hover:no-underline">{tokenFilter}</a>
                  </Link>
                </h5>
              </div>
              <div className="px-4 md:py-0 py-2">
                <p className="text-xs my-1 text-nearblue-600">BALANCE</p>

                {inventoryLoading ? (
                  <Skeleton className="w-40" />
                ) : (
                  <p className="text-sm my-1">
                    {Number(filterToken?.rpcAmount) && localFormat
                      ? localFormat(filterToken?.rpcAmount)
                      : ''}
                  </p>
                )}
              </div>
              <div className="px-4 md:py-0 py-2">
                <p className="text-xs my-1 text-nearblue-600">VALUE</p>

                {inventoryLoading ? (
                  <Skeleton className="w-40" />
                ) : (
                  <p className="text-sm my-1 flex">
                    {ftAmount && dollarFormat
                      ? '$' + dollarFormat(ftAmount)
                      : ''}
                    <span>
                      {filterToken?.ft_meta?.price && (
                        <div className="text-gray-400 ml-2">
                          @{filterToken?.ft_meta?.price}
                        </div>
                      )}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
