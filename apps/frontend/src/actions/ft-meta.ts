'use server';

import type { TokenMeta } from '@/components/txns/txn/actions/events/utils';
import { fetchFTContract } from '@/data/tokens/contract';

export const fetchFtsMeta = async (
  contracts: string[],
): Promise<Record<string, TokenMeta>> => {
  const unique = [...new Set(contracts)];
  const results = await Promise.all(
    unique.map(async (contract) => {
      try {
        const resp = await fetchFTContract(contract);
        const ft = resp.data;
        if (!ft) return null;
        return [
          contract,
          {
            decimals: ft.decimals,
            icon: ft.icon,
            name: ft.name,
            price: ft.price,
            symbol: ft.symbol,
          } satisfies TokenMeta,
        ] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(results.filter((r) => r !== null));
};
