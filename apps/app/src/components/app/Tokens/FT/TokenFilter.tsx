'use client';
import Big from 'big.js';
import { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import { dollarFormat, localFormat } from '@/utils/libs';
import { FtInfo, FtsInfo, InventoryInfo, TokenListInfo } from '@/utils/types';

import FaAddressBook from '@/components/app/Icons/FaAddressBook';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import { useRpcProvider } from '@/components/app/common/RpcContext';

interface Props {
  id: string;
  inventoryData: InventoryInfo;
  tokenFilter?: string;
}

export default function TokenFilter({ id, inventoryData, tokenFilter }: Props) {
  const modifiedId = id === 'eth.bridge.near' ? 'aurora' : id;
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const { rpc } = useRpcProvider();
  const { ftBalanceOf } = useRpc();
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    function loadBalances() {
      setInventoryLoading(true);
      const fts =
        inventoryData?.fts &&
        inventoryData?.fts.filter((f) => modifiedId == f.contract);

      if (fts?.length === 0) {
        setInventoryLoading(false);
        return;
      }

      let total = Big(0);

      const tokens: TokenListInfo[] = [];

      const pricedTokens: TokenListInfo[] = [];

      Promise.all(
        fts.map(async (ft: FtsInfo) => {
          const rslt = await ftBalanceOf(
            rpc,
            ft?.contract === 'aurora' ? 'eth.bridge.near' : ft?.contract,
            tokenFilter,
          );
          return { ...ft, amount: rslt };
        }),
      )
        .then((results: any) => {
          results.forEach((rslt: TokenListInfo) => {
            const ftrslt = rslt;
            const amount = rslt?.amount;

            let sum = Big(0);

            let rpcAmount = Big(0);

            if (amount) {
              rpcAmount = ftrslt.ft_meta?.decimals
                ? Big(amount).div(Big(10).pow(+ftrslt.ft_meta?.decimals))
                : Big(0);
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
        })
        .catch((error) => console.error(error))
        .finally(() => {
          setInventoryLoading(false);
        });
    }

    loadBalances();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, modifiedId, tokenFilter]);

  const filterToken: TokenListInfo = ft?.tokens?.length
    ? ft?.tokens[0]
    : ({} as TokenListInfo);

  const ftAmount = ft?.amount ?? 0;

  return (
    <>
      {tokenFilter && (
        <div className="py-2 mb-4">
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl  px-2 py-3">
            <div className="grid md:grid-cols-3 grid-cols-1 divide-y md:divide-y-0 dark:divide-black-200 md:divide-x">
              <div className="px-4 md:py-0 py-2">
                <div className="flex items-center">
                  <FaAddressBook />
                  <h5 className="text-xs my-1 font-bold ml-1 dark:text-neargray-10">
                    FILTERED BY TOKEN HOLDER
                  </h5>
                </div>
                <h5 className="text-sm my-1 font-bold text-green-500 dark:text-green-250 truncate md:max-w-[200px] lg:max-w-[310px] xl:max-w-full max-w-full inline-block">
                  <Link
                    className="hover:no-underline"
                    href={`/address/${tokenFilter}`}
                  >
                    {tokenFilter}
                  </Link>
                </h5>
              </div>
              <div className="px-4 md:py-0 py-2">
                <p className="text-xs my-1 text-nearblue-600 dark:text-neargray-10">
                  BALANCE
                </p>

                {inventoryLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p className="text-sm my-1 text-nearblue-600 dark:text-neargray-10">
                    {Number(filterToken?.rpcAmount)
                      ? localFormat(filterToken?.rpcAmount)
                      : ''}
                  </p>
                )}
              </div>
              <div className="px-4 md:py-0 py-2">
                <p className="text-xs my-1 text-nearblue-600 dark:text-neargray-10">
                  VALUE
                </p>
                {inventoryLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <div className="text-sm my-1 flex text-nearblue-600 dark:text-neargray-10">
                    {ftAmount ? '$' + dollarFormat(ftAmount) : ''}
                    <span>
                      {filterToken?.ft_meta?.price && (
                        <div className="text-gray-400 ml-2">
                          @{filterToken?.ft_meta?.price}
                        </div>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
