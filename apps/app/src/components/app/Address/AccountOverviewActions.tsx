'use client';
import Big from 'big.js';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import useRpc from '@/hooks/app/useRpc';
import { useRpcStore } from '@/stores/app/rpc';
import { dollarFormat, fiatValue, yoctoToNear } from '@/utils/app/libs';
import { AccountDataInfo, FtInfo, TokenListInfo } from '@/utils/types';

import TokenHoldings from '../common/TokenHoldings';
import FaExternalLinkAlt from '../Icons/FaExternalLinkAlt';
import { useParams } from 'next/navigation';
const AccountOverviewActions = ({
  accountData,
  inventoryData,
  loading = false,
  spamTokens,
  statsData,
  tokenData,
  status,
}: any) => {
  const { ftBalanceOf, viewAccount } = useRpc();
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const t = useTranslations();
  const { networkId } = useConfig();
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const params = useParams<{ id: string }>();

  const { rpc: rpcUrl, switchRpc } = useRpcStore();
  const [rpcError, setRpcError] = useState(false);
  useEffect(() => {
    if (rpcError) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcError]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const [account]: any = await Promise.all([viewAccount(params?.id)]);
        if (account) {
          setAccountView((prev) => {
            if (!prev || prev.account_id !== account?.account_id) {
              return account as any;
            }
            return prev;
          });
        } else {
          setAccountView(null);
        }
      } catch (error) {
        console.error('Error loading schema:', error);
      }
    };

    fetchAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData, params?.id, rpcUrl, status]);

  const accountInfo = accountData || accountView;
  const balance = accountData?.amount
    ? accountData?.amount
    : accountView?.amount;
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

          const amount = await ftBalanceOf(
            rpcUrl,
            ft.contract,
            params?.id as string,
          ).catch(() => {
            setRpcError(true);
          });
          if (amount?.data) {
            rpcAmount = ft?.ft_meta?.decimals
              ? Big(amount?.data).div(Big(10).pow(+ft.ft_meta.decimals))
              : Big(0);
          }
          if (ft?.ft_meta?.price) {
            sum = rpcAmount.mul(Big(ft?.ft_meta?.price));
            total = total.add(sum);

            return pricedTokens.push({
              ...ft,
              amountUsd: sum?.toString(),
              rpcAmount: rpcAmount?.toString(),
            });
          }

          return tokens.push({
            ...ft,
            amountUsd: sum?.toString(),
            rpcAmount: rpcAmount?.toString(),
          });
        }),
      );

      if (tokens) {
        tokens?.sort((a, b) => {
          const first = Big(a?.rpcAmount);

          const second = Big(b?.rpcAmount);

          if (first?.lt(second)) return 1;
          if (first?.gt(second)) return -1;

          return 0;
        });
      }

      pricedTokens?.sort((a, b) => {
        const first = Big(a?.amountUsd);

        const second = Big(b?.amountUsd);

        if (first?.lt(second)) return 1;
        if (first?.gt(second)) return -1;

        return 0;
      });

      setFT({
        amount: total.toString(),
        tokens: [...pricedTokens, ...tokens],
      });
    };

    loadBalances();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, params?.id, rpcUrl]);

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
                  className="ml-1"
                  href={tokenData?.website}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  <FaExternalLinkAlt />
                </a>
              )}
            </div>
          )}
        </div>
        <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
          <div className="xl:flex flex-wrap xl:flex-nowrap py-4">
            <div className="w-36 xl:mb-0 mb-1.5">
              {t('balance') || 'Balance'}:
            </div>

            <div className="w-full break-words">
              {balance ? yoctoToNear(balance, true) + ' Ⓝ' : ''}
            </div>
          </div>
          {networkId === 'mainnet' && (
            <div className="xl:flex flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="w-36 xl:mb-0 mb-1.5">
                {t('value') || 'Value:'}
              </div>

              <div className="w-full break-words flex items-center">
                {accountInfo?.amount && statsData?.near_price && (
                  <>
                    <span>
                      {accountInfo?.amount && statsData?.near_price
                        ? '$' +
                          fiatValue(
                            yoctoToNear(accountInfo?.amount, false),
                            statsData?.near_price,
                          ) +
                          ' '
                        : ''}
                    </span>
                    <span className="text-xs">
                      (@{' '}
                      {nearPrice
                        ? '$' + dollarFormat(statsData?.near_price)
                        : ''}{' '}
                      / Ⓝ)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="xl:flex flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10 w-full">
            <div className="w-36 xl:mb-0 mb-1.5">
              {t('tokens') || 'Tokens:'}
            </div>
            <div className="break-words -my-1 z-10 flex w-full">
              <TokenHoldings
                data={inventoryData}
                ft={ft}
                id={params?.id as string}
                inventoryLoading={loading}
                loading={loading}
                spamTokens={spamTokens?.blacklist}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewActions;
