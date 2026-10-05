import { useCallback, useEffect, useRef, useState } from 'react';

import { createCache } from '@/libs/cache';
import { isRateLimited } from '@/libs/fetcher';
import { getAccount, getBlock, getTxn } from '@/libs/rpc';
import { classifyQuery, MIN_SEARCH_LENGTH } from '@/libs/utils';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { SearchResult } from '@/types/types';

const initial: SearchResult = {
  account: undefined,
  block: undefined,
  query: undefined,
  txn: undefined,
};

type SearchStatus = 'failed' | 'rate-limited' | null;

const cache = createCache<SearchResult>(60_000, 50);

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SearchStatus>(null);
  const [results, setResults] = useState<SearchResult>(initial);
  const rpcUrl = useRpcStore((state) => state.rpc);
  const providers = useNetworkStore((state) => state.providers);
  const controller = useRef<AbortController>();
  const lastQuery = useRef<string>();
  const inFlight = useRef<{
    key: string;
    promise: Promise<SearchResult | undefined>;
  }>();

  const search = useCallback(
    (query?: string): Promise<SearchResult | undefined> => {
      if (!query || query.length < MIN_SEARCH_LENGTH) {
        controller.current?.abort();
        inFlight.current = undefined;
        lastQuery.current = undefined;
        setLoading(false);
        setStatus(null);
        setResults(initial);

        return Promise.resolve(undefined);
      }

      const url = rpcUrl || providers?.[0]?.url;
      const key = `${url}|${query}`;

      if (inFlight.current?.key === key) return inFlight.current.promise;

      controller.current?.abort();
      lastQuery.current = query;
      setStatus(null);

      const cached = cache.get(key);

      if (cached) {
        inFlight.current = undefined;
        setLoading(false);
        setResults(cached);

        return Promise.resolve(cached);
      }

      const abort = new AbortController();
      const target = classifyQuery(query);

      controller.current = abort;
      setLoading(true);
      setResults((res) => ({ ...res, query }));

      const promise = Promise.all([
        target.account
          ? getAccount(url, target.account, abort.signal)
          : undefined,
        target.block !== undefined
          ? getBlock(url, target.block, abort.signal)
          : undefined,
        target.txn ? getTxn(url, target.txn, abort.signal) : undefined,
      ])
        .then(([account, block, txn]) => {
          if (abort.signal.aborted) return undefined;

          const data = { account, block, query, txn };

          cache.set(key, data);
          setResults(data);
          setLoading(false);

          return data;
        })
        .catch((error) => {
          if (abort.signal.aborted) return undefined;

          setStatus(isRateLimited(error) ? 'rate-limited' : 'failed');
          setResults({ ...initial, query });
          setLoading(false);

          return undefined;
        })
        .finally(() => {
          if (inFlight.current?.key === key) inFlight.current = undefined;
        });

      inFlight.current = { key, promise };

      return promise;
    },
    [rpcUrl, providers],
  );

  useEffect(() => {
    if (lastQuery.current) search(lastQuery.current);
  }, [search]);

  useEffect(() => () => controller.current?.abort(), []);

  return { loading, results, search, status };
};
