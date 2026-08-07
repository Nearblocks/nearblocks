import { randomBytes } from 'crypto';
import { request } from 'undici';

import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { createBase58check } from '@scure/base';

import { Network } from 'nb-types';

import config from '#config';
import { NotFoundError, RateLimitError, RpcError } from '#libs/errors';
import { ZcashBlock, ZcashRpcRequest, ZcashRpcResponse } from '#types/types';

const b58check = createBase58check(sha256);

const prefix =
  config.network === Network.MAINNET
    ? Uint8Array.from([0x1c, 0xb8]) // t1
    : Uint8Array.from([0x1d, 0x25]); // tm

export const rpcCall = async <T>(
  url: string,
  method: string,
  params: unknown[] = [],
): Promise<T> => {
  const payload: ZcashRpcRequest = {
    id: randomBytes(8).toString('hex'),
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

  const json = (await body.json()) as ZcashRpcResponse<T>;

  if (json.error) {
    throw new Error(json.error.message);
  }

  if (!json.result) {
    throw new NotFoundError('block not found');
  }

  return json.result as T;
};

export const getLatestBlock = async (url: string): Promise<number> => {
  return rpcCall<number>(url, 'getblockcount');
};

export const getBlock = async (
  url: string,
  height: number,
): Promise<ZcashBlock> => {
  const blockHash = await rpcCall<string>(url, 'getblockhash', [height]);

  return rpcCall<ZcashBlock>(url, 'getblock', [blockHash, 2]);
};

export const pubKeyToTransparent = (pubKeyHex: string): string => {
  const hash = ripemd160(sha256(Buffer.from(pubKeyHex, 'hex')));

  return b58check.encode(Uint8Array.from([...prefix, ...hash]));
};
