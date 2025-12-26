import 'server-only';

import { getServerConfig, ServerEnv } from './config';

const config: ServerEnv = getServerConfig();

export const fetcher = async <T>(url: string, options?: RequestInit) => {
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
