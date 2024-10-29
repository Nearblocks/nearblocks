'use client';
import React, { useEffect, useState } from 'react';
import { dollarFormat, fiatValue, yoctoToNear } from '@/utils/app/libs';
import TokenHoldings from '../common/TokenHoldings';
import FaExternalLinkAlt from '../Icons/FaExternalLinkAlt';
import useRpc from '@/hooks/useRpc';
import Big from 'big.js';
import { FtInfo, TokenListInfo } from '@/utils/types';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/hooks/app/useConfig';

export default function AccountOverview({
  id,
  accountData,
  statsData,
  tokenData,
  inventoryData,
  spamTokens,
  loading = false,
}: any) {
  const { ftBalanceOf } = useRpc();
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const t = useTranslations();
  const { networkId } = useConfig();

  const balance = accountData?.amount ?? '';
  const nearPrice = statsData?.near_price ?? '';

  useEffect(() => {
    const loadBalances = async () => {
      const fts = inventoryData?.fts;

      let total = Big(0);

      const tokens: TokenListInfo[] = [];

      const pricedTokens: TokenListInfo[] = [];

      await Promise.all(
        fts.map(async (ft: TokenListInfo) => {
          let sum = Big(0);
          let rpcAmount = Big(0);
          try {
            let amount = await ftBalanceOf(ft.contract, id as string);
            if (amount) {
              rpcAmount = ft?.ft_meta?.decimals
                ? Big(amount).div(Big(10).pow(+ft.ft_meta.decimals))
                : Big(0);
            }
          } catch (error) {
            console.log({ error });
          }

          if (ft?.ft_meta?.price) {
            sum = rpcAmount.mul(Big(ft?.ft_meta?.price));
            total = total.add(sum);

            return pricedTokens.push({
              ...ft,
              amountUsd: sum.toString(),
              rpcAmount: rpcAmount.toString(),
            });
          }

          return tokens.push({
            ...ft,
            amountUsd: sum.toString(),
            rpcAmount: rpcAmount.toString(),
          });
        }),
      );

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
    };

    loadBalances().catch(console.log);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, id]);

  return (
    <div className="w-full">
      <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
        <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
          <h2 className="leading-6 text-sm font-semibold">
            {t('overview') || 'Overview'}
          </h2>
          {tokenData?.name && (
            <div className="flex items-center text-xs bg-gray-100 dark:bg-black-200 dark:text-neargray-10 rounded-md px-2 py-1">
              <div className="truncate max-w-[110px]">{tokenData?.name}</div>
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
              {t('balance') || 'Balance'}:
            </div>

            <div className="w-full md:w-3/4 break-words">
              {balance ? yoctoToNear(accountData?.amount, true) + ' Ⓝ' : ''}
            </div>
          </div>
          {networkId === 'mainnet' && (
            <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('value') || 'Value:'}
              </div>

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
                  (@{' '}
                  {nearPrice ? '$' + dollarFormat(statsData?.near_price) : ''} /
                  Ⓝ)
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              {t('tokens') || 'Tokens:'}
            </div>
            <div className="w-full md:w-3/4 break-words -my-1 z-10">
              <TokenHoldings
                data={inventoryData}
                loading={loading}
                inventoryLoading={loading}
                ft={ft}
                id={id as string}
                spamTokens={spamTokens?.blacklist}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
