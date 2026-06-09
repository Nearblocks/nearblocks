'use client';

import {
  experimentalProtocolConfig,
  NearRpcClient,
} from '@near-js/jsonrpc-client';
import useSWR from 'swr';

import { sessionRequired } from '@/lib/session';

import { useConfig } from './use-config';
import { useSession } from './use-session';
import { useSettings } from './use-settings';

export const useProtocolConfig = () => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const config = useConfig((s) => s.config);
  const token = useSession((s) => s.token);
  const ready = useSession((s) => s.ready);

  const rpcUrl = (provider || config.provider).url;
  const required = sessionRequired(rpcUrl, config);
  const gated = required && !ready;
  const shouldFetch = hydrated && rpcUrl && !gated;

  return useSWR(
    shouldFetch ? ['protocol-config', rpcUrl, required ? token : null] : null,
    async () => {
      const client = new NearRpcClient({
        endpoint: rpcUrl,
        headers: required && token ? { 'x-rpc-session': token } : undefined,
      });
      return experimentalProtocolConfig(client, { finality: 'final' });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );
};
