import { request } from 'undici';

import { NotFoundError, RateLimitError, RpcError } from '#libs/errors';
import { EvmBlock, EvmRpcRequest, EvmRpcResponse } from '#types/types';

export const rpcCall = async <T>(
  url: string,
  method: string,
  params: unknown[] = [],
): Promise<T> => {
  const payload: EvmRpcRequest = {
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

  const json = (await body.json()) as EvmRpcResponse<T>;

  if (!json.result) {
    throw new NotFoundError('block not found');
  }

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.result as T;
};

export const getLatestBlock = async (url: string): Promise<number> => {
  const result = await rpcCall<string>(url, 'eth_blockNumber');

  return parseInt(result, 16);
};

export const getBlock = async (
  url: string,
  height: number,
): Promise<EvmBlock | null> => {
  return rpcCall<EvmBlock>(url, 'eth_getBlockByNumber', [
    '0x' + height.toString(16),
    true,
  ]);
};

export const isValid = (r: Buffer, s: Buffer) => {
  if (
    (r.length === 1 && r[0] === 0) ||
    r.every((byte) => byte === 0x22) ||
    (s.length === 4 && s.equals(Buffer.from([0x5c, 0xa1, 0xab, 0x1e])))
  ) {
    return false;
  }

  return true;
};
