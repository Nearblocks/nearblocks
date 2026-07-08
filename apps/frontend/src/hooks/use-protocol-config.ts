'use client';

import { experimentalProtocolConfig } from '@near-js/jsonrpc-client';
import useSWR from 'swr';

import { rpcCall } from '@/lib/rpc';

import { useConfig } from './use-config';
import { useSettings } from './use-settings';

export const useProtocolConfig = () => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);

  const rpcUrl = (provider || defaultProvider).url;
  const shouldFetch = hydrated && rpcUrl;

  return useSWR(
    shouldFetch ? ['protocol-config', rpcUrl] : null,
    async () => {
      return rpcCall(rpcUrl, (client) =>
        experimentalProtocolConfig(client, { finality: 'final' }),
      );
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );
};
