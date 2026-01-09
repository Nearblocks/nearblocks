import 'server-only';

import { SearchParams } from '@/types/types';

import { getServerConfig } from './config';

export const fetcher = async <T>(url: string, options?: RequestInit) => {
  const config = getServerConfig();
  const baseUrl = config.API_URL;
  const apiKey = config.API_ACCESS_KEY;

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return res.json() as T;
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
