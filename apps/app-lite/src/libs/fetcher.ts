import type { RpcResponse } from 'nb-near';

const RETRIES = 3;

type FetchOptions = {
  retries?: number;
  signal?: AbortSignal;
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

const retryFetch = async (
  url: string,
  init: RequestInit,
  { retries = RETRIES, signal }: FetchOptions = {},
) => {
  let attempts = 0;

  for (;;) {
    try {
      const response = await fetch(url, { ...init, signal });

      if (response.status >= 500 || response.status === 429) throw response;

      return response;
    } catch (error) {
      if (signal?.aborted || attempts >= retries) throw error;

      attempts++;
      await sleep(1000 * Math.pow(2, attempts), signal);
    }
  }
};

export const isRateLimited = (error: unknown) =>
  error instanceof Response && error.status === 429;

export const rpcFetch = async <T>(
  url: string,
  method: string,
  params: unknown,
  options?: FetchOptions,
): Promise<T> => {
  const response = await retryFetch(
    url,
    {
      body: JSON.stringify({ id: 'near', jsonrpc: '2.0', method, params }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
    options,
  );
  const body = (await response.json()) as RpcResponse<T>;

  if (body.result) return body.result as T;

  throw body.error ?? new Error('Invalid RPC response');
};

export const getApiUrl = (network: string) =>
  network === 'mainnet'
    ? 'https://api.nearblocks.io/v1'
    : 'https://api-testnet.nearblocks.io/v1';

export const apiFetch = async <T>(
  url: string,
  options?: FetchOptions,
): Promise<T> => {
  const response = await retryFetch(
    url,
    { headers: { 'Content-Type': 'application/json' } },
    options,
  );

  return (await response.json()) as T;
};
