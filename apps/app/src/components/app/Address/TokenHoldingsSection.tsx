'use client';

import Big from 'big.js';
import React, { use, useEffect, useMemo, useRef, useState } from 'react';

import { useParams } from 'next/navigation';

import {
  FtInfo,
  IntentsTokenPrices,
  RefFinanceTokenPrices,
  TokenListInfo,
} from '@/utils/types';
import TokenHoldings from '@/components/app/common/TokenHoldings';
import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/components/app/common/RpcContext';

type BalanceCache = Record<string, FtInfo>;

type Props = {
  inventoryDataPromise: Promise<any>;
  mtsDataPromise: Promise<any>;
  spamTokensPromise: Promise<any>;
  intentsTokenPricesPromise: Promise<IntentsTokenPrices[]>;
  refTokenPricesPromise: Promise<RefFinanceTokenPrices>;
};

const TokenHoldingsSection = ({
  inventoryDataPromise,
  mtsDataPromise,
  spamTokensPromise,
  intentsTokenPricesPromise,
  refTokenPricesPromise,
}: Props) => {
  const inventory = use(inventoryDataPromise);
  const spam = use(spamTokensPromise);
  const mtsData = use(mtsDataPromise);
  const intentsTokenPrices = use(intentsTokenPricesPromise);
  const refTokenPrices = use(refTokenPricesPromise);

  const inventoryData = inventory?.inventory;
  const { ftBalanceOf } = useRpc();
  const params = useParams<{ id: string }>();
  const { rpc: rpcUrl } = useRpcProvider();
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const cacheRef = useRef<BalanceCache>({});

  const spamTokens = useMemo(() => {
    if (typeof spam === 'string') {
      try {
        return JSON.parse(spam);
      } catch {
        return null;
      }
    }
    return null;
  }, [spam]);

  useEffect(() => {
    const cacheKey = `${params?.id}_${rpcUrl}`;
    if (cacheRef.current[cacheKey]) {
      setFT(cacheRef.current[cacheKey]);
      return;
    }

    const loadBalances = async () => {
      // Temporary deduplication for eth.bridge.near contracts
      // Remove after API v3 migration completes
      const fts =
        inventoryData?.fts?.filter(
          (token: TokenListInfo) =>
            !(
              token?.ft_meta?.price === null &&
              token?.contract === 'eth.bridge.near'
            ),
        ) ?? [];
      let total = Big(0);
      const tokens: TokenListInfo[] = [];
      const pricedTokens: TokenListInfo[] = [];
      await Promise.all(
        fts?.map(async (ft: TokenListInfo) => {
          let sum = Big(0);
          let rpcAmount = Big(0);
          const amount = await ftBalanceOf(
            rpcUrl,
            ft?.contract === 'aurora' ? 'eth.bridge.near' : ft?.contract,
            params?.id as string,
          ).catch((error) => {
            console.error('Error in loadBalances:', error);
          });
          if (amount) {
            const decimals = ft?.ft_meta?.decimals ?? 0;
            rpcAmount = Big(amount).div(Big(10).pow(Number(decimals)));
          }
          const refPrice = refTokenPrices?.[ft?.contract]?.price;
          const tokenPrice = refPrice ?? ft?.ft_meta?.price;

          if (tokenPrice) {
            sum = rpcAmount.mul(Big(tokenPrice));
            total = total.add(sum);
            return pricedTokens.push({
              ...ft,
              ft_meta: {
                ...ft?.ft_meta,
                price: tokenPrice,
              },
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

      const result = {
        amount: total.toString(),
        tokens: [...pricedTokens, ...tokens],
      };
      cacheRef.current[cacheKey] = result;
      setFT(result);
    };
    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, params?.id, refTokenPrices, rpcUrl]);

  return (
    <TokenHoldings
      data={inventoryData}
      ft={ft}
      id={params?.id as string}
      inventoryLoading={false}
      loading={false}
      spamTokens={spamTokens?.blacklist}
      mtsData={mtsData}
      intentsTokenPrices={intentsTokenPrices}
    />
  );
};

export default TokenHoldingsSection;
