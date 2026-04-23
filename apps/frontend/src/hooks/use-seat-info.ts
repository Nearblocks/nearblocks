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

const findSeatPrice = (
  validatorList: { stake: string }[],
  minimumStakeRatio: number[],
): bigint => {
  const stakes = validatorList
    .map((v) => BigInt(v.stake))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const [ratioNum, ratioDen] = minimumStakeRatio;
  const stakesSum = stakes.reduce((a, b) => a + b);

  return (stakesSum * BigInt(ratioNum)) / BigInt(ratioDen);
};

const fetchSeatInfo = async (rpcUrl: string): Promise<SeatInfo> => {
  const client = new NearRpcClient({ endpoint: rpcUrl });

  const [validatorsResp, protocolConfigResp] = await Promise.all([
    validators(client, 'latest'),
    experimentalProtocolConfig(client, { finality: 'final' }),
  ]);

  const minStakeRatio = protocolConfigResp.minimumStakeRatio ?? [1, 6250];

  const currentSeatPrice =
    validatorsResp.currentValidators.length > 0
      ? findSeatPrice(validatorsResp.currentValidators, minStakeRatio)
      : null;

  const nextSeatPrice =
    validatorsResp.nextValidators.length > 0
      ? findSeatPrice(validatorsResp.nextValidators, minStakeRatio)
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
