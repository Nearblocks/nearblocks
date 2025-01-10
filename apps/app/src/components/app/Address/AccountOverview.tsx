'use client';
import Big from 'big.js';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useRpcStore } from '@/stores/app/rpc';
import { dollarFormat, fiatValue, yoctoToNear } from '@/utils/app/libs';
import { AccountDataInfo, FtInfo, TokenListInfo } from '@/utils/types';

import TokenHoldings from '../common/TokenHoldings';
import FaExternalLinkAlt from '../Icons/FaExternalLinkAlt';

export default function AccountOverview({
  accountData,
  id,
  inventoryData,
  loading = false,
  spamTokens,
  statsData,
  tokenData,
}: any) {
  const { ftBalanceOf, viewAccount } = useRpc();
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const t = useTranslations();
  const { networkId } = useConfig();
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const initializedRef = useRef(false);
  const [rpcError, setRpcError] = useState(false);
  const [_allRpcProviderError, setAllRpcProviderError] = useState(false);

  const useRpcStoreWithProviders = () => {
    const setProviders = useRpcStore((state) => state.setProviders);
    const { RpcProviders } = useRpcProvider();
    useEffect(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setProviders(RpcProviders);
      }
    }, [RpcProviders, setProviders]);

    return useRpcStore((state) => state);
  };

  const { rpc: rpcUrl, switchRpc } = useRpcStoreWithProviders();

  useEffect(() => {
    if (rpcError) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        setAllRpcProviderError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
  }, [rpcError, switchRpc]);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!accountData || accountData?.length === 0) {
        try {
          const [account]: any = await Promise.all([
            viewAccount(id).catch(() => setRpcError(true)),
          ]);

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
          setRpcError(true);
          console.log('Error loading schema:', error);
        }
      }
    };

    fetchAccountData();
  }, [accountData, id, viewAccount, rpcUrl]);

  const accountInfo = accountData || accountView;
  const balance = accountInfo?.amount ?? '';
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
          <div className="flex-1 flex-wrap py-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              {t('balance') || 'Balance'}:
            </div>

            <div className="w-full md:w-3/4 break-words">
              {balance ? yoctoToNear(balance, true) + ' Ⓝ' : ''}
            </div>
          </div>
          {networkId === 'mainnet' && (
            <div className="flex-1 flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('value') || 'Value:'}
              </div>

              <div className="w-full md:w-3/4 break-words flex items-center">
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
          <div className="flex-1 flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2">
              {t('tokens') || 'Tokens:'}
            </div>
            <div className="w-full break-words -my-1 z-10">
              <TokenHoldings
                data={inventoryData}
                ft={ft}
                id={id as string}
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
}
