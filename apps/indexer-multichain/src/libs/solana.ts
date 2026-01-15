import { request } from 'undici';

import { NotFoundError, RateLimitError, RpcError } from '#libs/errors';
import { SolanaBlock, SolanaRpcRequest, SolanaRpcResponse } from '#types/types';

export const rpcCall = async <T>(
  url: string,
  method: string,
  params: unknown[] = [],
  options: { allowNull?: boolean } = {},
): Promise<T> => {
  const payload: SolanaRpcRequest = {
    id: Date.now(),
    jsonrpc: '2.0',
    method,
    params,
  };

  const { body, statusCode } = await request(url, {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (statusCode < 200 || statusCode >= 300) {
    const error = await body.text();

    if (statusCode === 429) {
      throw new RateLimitError(error);
    }

    throw new RpcError(error);
  }

  const json = (await body.json()) as SolanaRpcResponse<T>;

  if (json.error) {
    if (options.allowNull && json.error.code === -32009) {
      return null as T;
    }

    throw new Error(json.error.message);
  }

  if (!json.result) {
    throw new NotFoundError('block not found');
  }

  return json.result as T;
};

export const getLatestSlot = async (url: string): Promise<number> => {
  return rpcCall<number>(url, 'getSlot');
};

export const getBlock = async (
  url: string,
  slot: number,
): Promise<null | SolanaBlock> => {
  return rpcCall<null | SolanaBlock>(
    url,
    'getBlock',
    [slot, { encoding: 'json', maxSupportedTransactionVersion: 0 }],
    { allowNull: true },
  );
};
