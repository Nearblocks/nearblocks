import 'server-only';

import { SearchParams } from '@/types/types';

import { getServerConfig } from './config';
import { trackForHold } from './hold-nav';

export const fetcher = <T>(url: string, options?: RequestInit): Promise<T> => {
  const run = async () => {
    const config = getServerConfig();
    const baseUrl = config.API_URL;
    const apiKey = config.API_ACCESS_KEY;

    const res = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${apiKey}`,
      },
      // A hung upstream connection would otherwise keep the RSC stream (and
      // the user's skeletons) open forever.
      signal: options?.signal ?? AbortSignal.timeout(30_000),
    });

    return res.json() as T;
  };

  // Every data fetch registers with the per-request hold registry so pages
  // can `await holdNav()` without hand-listing their promises.
  return trackForHold(run());
};

export const safeParams = <T extends SearchParams>(
  params: T,
  validKeys: readonly (keyof T)[],
) => {
  const queryParams = new URLSearchParams();

  for (const key of validKeys) {
    const value = params[key];
    if (value == null) continue;
    if (typeof value === 'string' && value.length === 0) continue;
    queryParams.set(String(key), String(value));
  }

  return queryParams;
};
