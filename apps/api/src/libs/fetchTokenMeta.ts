import { providers } from 'near-api-js';

import { RPCResponse } from '#types/types';

import { fetchMeta } from './fetchMeta.js';
import { bytesParse, callFunction } from './near.js';
import redis from './redis.js';

interface FtMetadata {
  decimals?: number;
  description?: string;
  extra?: Record<string, unknown>;
  icon?: string;
  issued_at?: number;
  media?: string;
  name?: string;
  reference?: string;
  reference_hash?: null | string;
  spec?: string;
  starts_at?: number;
  symbol?: string;
  title?: string;
  updated_at?: number;
}

interface NftMetadata {
  base_uri: null | string;
  decimals?: number;
  description?: string;
  extra?: Record<string, unknown>;
  icon?: string;
  issued_at?: number;
  media?: string;
  name?: string;
  reference?: string;
  reference_hash?: null | string;
  spec?: string;
  starts_at?: number;
  symbol?: string;
  title?: string;
  updated_at?: number;
}

export type MtMetadata = {
  decimals?: number;
  description?: string;
  extra?: Record<string, unknown>;
  icon?: string;
  issued_at?: number;
  media?: string;
  name?: string;
  reference?: string;
  reference_hash?: null | string;
  spec?: string;
  starts_at?: number;
  symbol?: string;
  title?: string;
  updated_at?: number;
};

const EXPIRY = 60;

const fetchContractMetadata = async <T>(
  provider: providers.JsonRpcProvider,
  contract: string,
  method: string,
  args: Record<string, unknown> = {},
): Promise<null | T> => {
  try {
    const response: RPCResponse = await callFunction(
      provider,
      contract,
      method,
      args,
    );
    return bytesParse(response.result);
  } catch (error) {
    return null;
  }
};

export const fetchMtMetadata = async (
  provider: providers.JsonRpcProvider,
  contract: string,
  tokenId: string,
): Promise<MtMetadata | null> => {
  return redis.cache(
    `mt:${contract}:${tokenId}:metadata`,
    async () => {
      try {
        const metas = await fetchMeta(contract, tokenId, EXPIRY);
        if (metas?.[0]) return metas[0];
      } catch (error) {
        console.error(`fetchMeta failed for ${contract}:${tokenId}`, error);
      }

      const metadata = await fetchContractMetadata<MtMetadata>(
        provider,
        contract,
        'mt_metadata',
        { token_id: tokenId },
      );

      if (!metadata) return null;

      return {
        base: {
          decimals: metadata.decimals,
          icon: metadata.icon,
          id: tokenId,
          name: metadata.name || 'Unknown Token',
          symbol: metadata.symbol || '',
        },
        token: {
          description: metadata.description,
          extra: metadata.extra ? JSON.stringify(metadata.extra) : '{}',
          issued_at: metadata.issued_at,
          media: metadata.icon,
          starts_at: metadata.starts_at,
          title: metadata.name,
          updated_at: metadata.updated_at,
        },
      };
    },
    EXPIRY * 24,
  );
};

export const fetchFtMetadata = async (
  provider: providers.JsonRpcProvider,
  contract: string,
): Promise<{
  base: {
    decimals?: number;
    icon?: string;
    id: string;
    name: string;
    symbol: string;
  };
  token: {
    description?: string;
    extra?: string;
    issued_at?: number;
    media?: string;
    reference?: string;
    reference_hash?: null | string;
    spec?: string;
    starts_at?: number;
    title?: string;
    updated_at?: number;
  };
} | null> => {
  return redis.cache(
    `ft:${contract}:metadata`,
    async () => {
      const metadata = await fetchContractMetadata<FtMetadata>(
        provider,
        contract,
        'ft_metadata',
      );

      if (!metadata) return null;

      return {
        base: {
          decimals: metadata.decimals,
          icon: metadata.icon,
          id: contract,
          name: metadata.name || 'Unknown Token',
          symbol: metadata.symbol || '',
        },
        token: {
          description: metadata.description,
          extra: metadata.extra ? JSON.stringify(metadata.extra) : '{}',
          issued_at: metadata.issued_at,
          media: metadata.media,
          reference: metadata.reference,
          reference_hash: metadata.reference_hash,
          spec: metadata.spec,
          starts_at: metadata.starts_at,
          title: metadata.title || metadata.name,
          updated_at: metadata.updated_at,
        },
      };
    },
    EXPIRY * 24,
  );
};

export const fetchNftMetadata = async (
  provider: providers.JsonRpcProvider,
  contract: string,
): Promise<{
  base: {
    icon?: string;
    id: string;
    name: string;
    symbol?: string;
  };
  token: {
    base_uri?: null | string;
    description?: string;
    extra?: string;
    issued_at?: number;
    media?: string;
    reference?: string;
    reference_hash?: null | string;
    spec?: string;
    starts_at?: number;
    title?: string;
    updated_at?: number;
  };
} | null> => {
  return redis.cache(
    `nft:${contract}:metadata`,
    async () => {
      const metadata = await fetchContractMetadata<NftMetadata>(
        provider,
        contract,
        'nft_metadata',
      );

      if (!metadata) return null;

      return {
        base: {
          icon: metadata.icon,
          id: contract,
          name: metadata.name || 'Unknown NFT',
          symbol: metadata.symbol || '',
        },
        token: {
          base_uri: metadata.base_uri,
          description: metadata.description,
          extra: metadata.extra ? JSON.stringify(metadata.extra) : '{}',
          issued_at: metadata.issued_at,
          media: metadata.media,
          reference: metadata.reference,
          reference_hash: metadata.reference_hash,
          spec: metadata.spec,
          starts_at: metadata.starts_at,
          title: metadata.title || metadata.name,
          updated_at: metadata.updated_at,
        },
      };
    },
    EXPIRY * 24,
  );
};
