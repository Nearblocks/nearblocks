import { logger } from 'nb-logger';
import { REJECT_MARKERS } from 'nb-near';

import { axiosRpc as RPC } from '#libs/rpc';
import {
  FTMetadata,
  MTContractMetadata,
  MTTokenMetadataInfo,
  NFTMetadata,
  NFTTokenInfo,
} from '#types/types';

export type FetchOutcome<T> =
  | { data: T; ok: true }
  | { ok: false; permanent: boolean };

const permanentResult = { ok: false as const, permanent: true };
const transientResult = { ok: false as const, permanent: false };

type RpcErrorBody = {
  error?: { cause?: { name?: string }; message?: string };
  result?: { error?: string };
};

const errorMarker = (body: unknown): string => {
  const b = body as RpcErrorBody | undefined;

  return String(
    b?.result?.error ?? b?.error?.cause?.name ?? b?.error?.message ?? '',
  ).toLowerCase();
};

const isPermanentMarker = (marker: string): boolean =>
  REJECT_MARKERS.some((rejectMarker) => marker.includes(rejectMarker));

type RawOutcome<T> = { ok: false; permanent: boolean } | { ok: true; raw: T };

const fetchView = async <T>(
  contract: string,
  method: string,
  args: unknown = {},
): Promise<RawOutcome<T>> => {
  try {
    const { data } = await RPC.callFunction(
      contract,
      method,
      RPC.encodeArgs(args),
    );

    if (data?.result?.result) {
      return { ok: true, raw: RPC.decodeResult<T>(data.result.result) };
    }

    return isPermanentMarker(errorMarker(data))
      ? permanentResult
      : transientResult;
  } catch (error) {
    logger.error(`near: fetchView: ${contract}: ${method}`);
    logger.error(error);

    return transientResult;
  }
};

export const fetchFTSupply = async (
  contract: string,
): Promise<FetchOutcome<string>> => {
  const outcome = await fetchView<string>(contract, 'ft_total_supply');

  if (!outcome.ok) return outcome;
  if (outcome.raw) return { data: outcome.raw, ok: true };

  return permanentResult;
};

export const fetchFTMeta = async (
  contract: string,
): Promise<FetchOutcome<FTMetadata>> => {
  const outcome = await fetchView<FTMetadata>(contract, 'ft_metadata');

  if (!outcome.ok) return outcome;
  if (outcome.raw?.name && outcome.raw?.symbol) {
    return { data: outcome.raw, ok: true };
  }

  return permanentResult;
};

export const fetchMTMeta = async (
  contract: string,
): Promise<FetchOutcome<MTContractMetadata>> => {
  const outcome = await fetchView<MTContractMetadata>(
    contract,
    'mt_metadata_contract',
  );

  if (!outcome.ok) return outcome;
  if (outcome.raw?.name) return { data: outcome.raw, ok: true };

  return permanentResult;
};

export const fetchMTTokenMeta = async (
  contract: string,
  token: string,
): Promise<FetchOutcome<MTTokenMetadataInfo>> => {
  const outcome = await fetchView<MTTokenMetadataInfo[]>(
    contract,
    'mt_metadata_token_all',
    { token_ids: [token] },
  );

  if (!outcome.ok) return outcome;

  const meta = outcome.raw?.[0];

  if (meta?.base && meta?.token) return { data: meta, ok: true };

  return permanentResult;
};

export const fetchNFTMeta = async (
  contract: string,
): Promise<FetchOutcome<NFTMetadata>> => {
  const outcome = await fetchView<NFTMetadata>(contract, 'nft_metadata');

  if (!outcome.ok) return outcome;
  if (outcome.raw?.name) return { data: outcome.raw, ok: true };

  return permanentResult;
};

export const fetchNFTTokenMeta = async (
  contract: string,
  token: string,
): Promise<FetchOutcome<NFTTokenInfo>> => {
  const outcome = await fetchView<NFTTokenInfo>(contract, 'nft_token', {
    token_id: token,
  });

  if (!outcome.ok) return outcome;
  if (outcome.raw?.metadata) return { data: outcome.raw, ok: true };

  return permanentResult;
};
