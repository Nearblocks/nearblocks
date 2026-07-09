import { cache } from 'react';

import {
  AccountKeyCount,
  AccountKeyCountRes,
  AccountKeysReq,
  AccountKeysRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { isMlDsaHashKey } from '@/lib/keys';
import { SearchParams } from '@/types/types';

export const fetchKeys = cache(
  async (account: string, params: SearchParams): Promise<AccountKeysRes> => {
    const keys: (keyof AccountKeysReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountKeysRes>(
      `/v3/accounts/${account}/keys?${queryParams.toString()}`,
    );
    return resp;
  },
);

/**
 * Whether the account currently holds a full-access post-quantum
 * (`ml-dsa-65-hash:`) key. Scans the first page of key actions; an account with
 * more than PROBE_LIMIT key events may be under-reported (presentational only).
 */
export const fetchQuantumSafe = cache(
  async (account: string): Promise<boolean> => {
    const PROBE_LIMIT = 100;

    try {
      const resp = await fetcher<AccountKeysRes>(
        `/v3/accounts/${account}/keys?limit=${PROBE_LIMIT}`,
      );

      return (resp.data ?? []).some(
        (key) =>
          key.permission_kind === 'FULL_ACCESS' &&
          !key.deleted.transaction_hash &&
          isMlDsaHashKey(key.public_key),
      );
    } catch {
      return false;
    }
  },
);

export const fetchKeyCount = cache(
  async (account: string): Promise<AccountKeyCount | null> => {
    const resp = await fetcher<AccountKeyCountRes>(
      `/v3/accounts/${account}/keys/count`,
    );
    return resp.data;
  },
);
