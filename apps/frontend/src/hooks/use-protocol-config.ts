'use client';

import { experimentalProtocolConfig } from '@near-js/jsonrpc-client';
import useSWR from 'swr';

import { rpcCall } from '@/lib/rpc';

import { useConfig } from './use-config';
import { useSettings } from './use-settings';

export const useProtocolConfig = () => {
  const hydrated = useSettings((s) => s.hydrated);
  const provider = useConfig((s) => s.config.provider);

  const rpcUrl = provider.url;
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
