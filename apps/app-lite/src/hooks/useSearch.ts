import { useCallback, useState } from 'react';

import { RPC } from 'nb-near';

import { getAccount, getBlock, getReceipt, getTxn } from '@/libs/rpc';
import { isValidAccount } from '@/libs/utils';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { SearchResult } from '@/types/types';

const initial = {
  account: undefined,
  block: undefined,
  query: undefined,
  receipt: undefined,
  txn: undefined,
};

const providers = useNetworkStore.getState().providers;
const options = { defaultValue: providers?.[0]?.url };

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(initial);
  const rpcUrl = useRpcStore((state) => state.rpc);

  const search = useCallback(
    async (query?: string) => {
      if (!query) return setResults(initial);

      setLoading(true);
      setResults((res) => ({ ...res, query }));

      const rpc = new RPC(rpcUrl || options.defaultValue);
      const [account, block, txn, receipt] = await Promise.all([
        isValidAccount(query.toLocaleLowerCase())
          ? getAccount(rpc, query.toLocaleLowerCase())
          : undefined,
        query.length >= 43
          ? getBlock(rpc, query)
          : !isNaN(+query)
          ? getBlock(rpc, +query)
          : undefined,
        query.length >= 43 ? getTxn(rpc, query) : undefined,
        query.length >= 43 ? getReceipt(rpc, query) : undefined,
      ]);

      const data = {
        account: account?.result,
        block: block?.result,
        query,
        receipt: receipt?.result,
        txn: txn?.result,
      };
      setLoading(false);
      setResults(data);

      return data;
    },
    [rpcUrl],
  );

  return { loading, results, search };
};
