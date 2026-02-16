import { useMemo } from 'react';

import { AccountAssetFT } from 'nb-schemas';

import { useBatchView } from '@/hooks/use-rpc';
import { toTokenPrice } from '@/lib/format';

type UseTokenBalancesParams = {
  account: string;
  tokens: AccountAssetFT[];
};

export const useTokenBalances = (params: null | UseTokenBalancesParams) => {
  const batchParams = useMemo(() => {
    if (!params?.tokens?.length) return null;

    return params.tokens.map((token) => ({
      args: { account_id: params.account },
      contract: token.contract,
      method: 'ft_balance_of',
    }));
  }, [params]);

  const {
    data: balances,
    error,
    isLoading,
    mutate,
  } = useBatchView<string>(batchParams);

  const merged = useMemo(() => {
    if (!params?.tokens || !balances) return [];

    return params.tokens.map((token, index) => {
      const amount = balances[index] || '0';
      const price =
        token.meta?.price && token.meta?.decimals
          ? toTokenPrice(amount, token.meta.decimals, token.meta.price)
          : '0';

      return {
        ...token,
        amount,
        price,
      };
    });
  }, [params?.tokens, balances]);

  return {
    data: merged,
    error,
    isLoading,
    mutate,
  };
};
