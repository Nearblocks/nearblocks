import { useCallback, useState } from 'react';

import { RPC } from 'nb-near';

import { getAccount, getBlock, getTxn, providers } from '@/libs/rpc';
import { isValidAccount } from '@/libs/utils';
import { useRpcStore } from '@/stores/rpc';
import { SearchResult } from '@/types/types';

const initial = {
  account: undefined,
  block: undefined,
  query: undefined,
  txn: undefined,
};
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
      const [account, block, txn] = await Promise.all([
        isValidAccount(query.toLocaleLowerCase())
          ? getAccount(rpc, query.toLocaleLowerCase())
          : undefined,
        query.length === 44
          ? getBlock(rpc, query)
          : !isNaN(+query)
          ? getBlock(rpc, +query)
          : undefined,
        query.length === 44 ? getTxn(rpc, query) : undefined,
      ]);

      const data = {
        account: account?.result,
        block: block?.result,
        query,
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
