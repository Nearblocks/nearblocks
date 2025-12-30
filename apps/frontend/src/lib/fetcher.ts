import 'server-only';

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
