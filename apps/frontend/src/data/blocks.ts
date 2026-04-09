import { cache } from 'react';

import {
  Block,
  BlockCount,
  BlockCountRes,
  BlockRes,
  BlocksReq,
  BlocksRes,
  BlockStats,
  BlockStatsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchBlocks = cache(
  async (params: SearchParams): Promise<BlocksRes> => {
    const keys: (keyof BlocksReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<BlocksRes>(
      `/v3/blocks?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchBlockCount = cache(async (): Promise<BlockCount | null> => {
  const resp = await fetcher<BlockCountRes>(`/v3/blocks/count`);
  return resp.data;
});

export const fetchBlockStats = cache(async (): Promise<BlockStats | null> => {
  const resp = await fetcher<BlockStatsRes>(`/v3/blocks/stats`);
  return resp.data;
});

export const fetchBlock = cache(
  async (block: string): Promise<Block | null> => {
    const resp = await fetcher<BlockRes>(`/v3/blocks/${block}`);
    return resp.data;
  },
);
