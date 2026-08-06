'use client';

import { validators } from '@near-js/jsonrpc-client';
import useSWR from 'swr';

import { rpcCall } from '@/lib/rpc';

import { useConfig } from './use-config';
import { useSettings } from './use-settings';

export type ValidatorStatus =
  | 'active'
  | 'idle'
  | 'joining'
  | 'leaving'
  | 'proposal'
  | null;

export const useValidator = (node: string) => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);
  const rpcUrl = (provider || defaultProvider).url;

  const { data, isLoading } = useSWR(
    hydrated && rpcUrl ? ['node-validator-details', node, rpcUrl] : null,
    async () => {
      return rpcCall(rpcUrl, (client) => validators(client, 'latest'));
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const currentValidator = data?.currentValidators.find(
    (v) => v.accountId === node,
  );
  const nextValidator = data?.nextValidators.find((v) => v.accountId === node);
  const isProposal = data?.currentProposals.some((v) => v.accountId === node);

  const status: ValidatorStatus = currentValidator
    ? nextValidator
      ? 'active'
      : 'leaving'
    : nextValidator
    ? 'joining'
    : isProposal
    ? 'proposal'
    : data
    ? 'idle'
    : null;

  return { currentValidator, isLoading, status };
};
