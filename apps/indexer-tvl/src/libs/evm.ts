import { request } from 'undici';

import { NotFoundError, RateLimitError, RpcError } from '#libs/errors';
import {
  EvmBlockHeader,
  EvmLog,
  EvmRpcRequest,
  EvmRpcResponse,
} from '#types/types';

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
    bodyTimeout: 60_000,
    headers: { 'Content-Type': 'application/json' },
    headersTimeout: 60_000,
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

  if (json.error) {
    throw new RpcError(json.error.message);
  }

  if (json.result === undefined) {
    throw new NotFoundError(`empty result for ${method}`);
  }

  return json.result as T;
};

export const getLatestBlock = async (url: string): Promise<number> => {
  const result = await rpcCall<string>(url, 'eth_blockNumber');

  return parseInt(result, 16);
};

export const getBlockHeader = async (
  url: string,
  height: number,
): Promise<EvmBlockHeader | null> => {
  return rpcCall<EvmBlockHeader | null>(url, 'eth_getBlockByNumber', [
    '0x' + height.toString(16),
    false,
  ]);
};

export const getCode = async (
  url: string,
  address: string,
  blockTag: string,
): Promise<string> => {
  return rpcCall<string>(url, 'eth_getCode', [address, blockTag]);
};

export const ethCall = async (
  url: string,
  to: string,
  data: string,
  blockTag: string,
): Promise<string> => {
  return rpcCall<string>(url, 'eth_call', [{ data, to }, blockTag]);
};

export const getLogs = async (
  url: string,
  params: {
    address?: string;
    fromBlock: number;
    toBlock: number;
    topics: (null | string | string[])[];
  },
): Promise<EvmLog[]> => {
  return rpcCall<EvmLog[]>(url, 'eth_getLogs', [
    {
      ...(params.address ? { address: params.address } : {}),
      fromBlock: '0x' + params.fromBlock.toString(16),
      toBlock: '0x' + params.toBlock.toString(16),
      topics: params.topics,
    },
  ]);
};
