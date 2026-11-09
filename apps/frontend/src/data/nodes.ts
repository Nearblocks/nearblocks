import { cache } from 'react';

import { fetcher } from '@/lib/fetcher';

// Aggregates only; the per-node list stays on the server.
export type NodeStats = {
  by_country: Record<string, number>;
  by_version: Record<string, number>;
  total: number;
  validators: number;
};

type NodesRes = { data?: NodeStats };

export const fetchNodeStats = cache(async (): Promise<NodeStats | null> => {
  try {
    const res = await fetcher<NodesRes>('/v3/nodes', {
      next: { revalidate: 30 },
    });
    if (!res?.data) return null;
    const { by_country, by_version, total, validators } = res.data;
    return { by_country, by_version, total, validators };
  } catch {
    return null;
  }
});
