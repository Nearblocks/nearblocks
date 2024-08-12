import { useCallback, useEffect, useState } from 'react';

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

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>(initial);
  const rpcUrl = useRpcStore((state) => state.rpc);
  const providers = useNetworkStore((state) => state.providers);
  const network = useNetworkStore((state) => state.network);

  const search = useCallback(
    async (query?: string) => {
      if (!query) return setResults(initial);

      setLoading(true);
      setResults((res) => ({ ...res, query }));

      const rpc = new RPC(rpcUrl || providers?.[0]?.url);
      const receiptRpc =
        network === 'mainnet'
          ? new RPC('https://beta.rpc.mainnet.near.org')
          : new RPC('https://beta.rpc.testnet.near.org');

      const isQueryLong = query.length >= 43;

      const [account, block, txn, receipt] = await Promise.all([
        isValidAccount(query.toLocaleLowerCase())
          ? getAccount(rpc, query.toLocaleLowerCase())
          : undefined,
        isQueryLong
          ? getBlock(rpc, query)
          : !isNaN(+query)
          ? getBlock(rpc, +query)
          : undefined,
        isQueryLong ? getTxn(rpc, query) : undefined,
        isQueryLong ? getReceipt(receiptRpc, query) : undefined,
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
    [rpcUrl, providers, network],
  );

  useEffect(() => {
    if (results.query) {
      search(results.query);
    }
  }, [rpcUrl, search, results.query]);

  return { loading, results, search };
};
