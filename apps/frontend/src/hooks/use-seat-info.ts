'use client';

import {
  experimentalProtocolConfig,
  NearRpcClient,
  validators,
} from '@near-js/jsonrpc-client';
import useSWR from 'swr';

import { useConfig } from './use-config';
import { useSettings } from './use-settings';

type SeatInfo = {
  currentSeatPrice: bigint | null;
  isLoading: boolean;
  nextSeatPrice: bigint | null;
  protocolVersion: null | number;
};

const fetchSeatInfo = async (rpcUrl: string): Promise<SeatInfo> => {
  const client = new NearRpcClient({ endpoint: rpcUrl });

  const [validatorsResp, protocolConfigResp] = await Promise.all([
    validators(client, 'latest'),
    experimentalProtocolConfig(client, { finality: 'final' }),
  ]);

  const currentStakes = validatorsResp.currentValidators.map((v) =>
    BigInt(v.stake),
  );
  const nextStakes = validatorsResp.nextValidators.map((v) => BigInt(v.stake));

  const currentSeatPrice =
    currentStakes.length > 0
      ? currentStakes.reduce((min, s) => (s < min ? s : min))
      : null;

  const nextSeatPrice =
    nextStakes.length > 0
      ? nextStakes.reduce((min, s) => (s < min ? s : min))
      : null;

  return {
    currentSeatPrice,
    isLoading: false,
    nextSeatPrice,
    protocolVersion: protocolConfigResp.protocolVersion ?? null,
  };
};

export const useSeatInfo = (): SeatInfo => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);

  const rpcUrl = (provider || defaultProvider).url;
  const shouldFetch = hydrated && rpcUrl;

  const { data, isLoading } = useSWR<SeatInfo>(
    shouldFetch ? ['seat-info', rpcUrl] : null,
    () => fetchSeatInfo(rpcUrl),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  return {
    currentSeatPrice: data?.currentSeatPrice ?? null,
    isLoading,
    nextSeatPrice: data?.nextSeatPrice ?? null,
    protocolVersion: data?.protocolVersion ?? null,
  };
};
