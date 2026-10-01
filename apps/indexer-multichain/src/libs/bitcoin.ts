import { randomBytes } from 'crypto';

import { NETWORK, p2pkh, p2wpkh, TEST_NETWORK } from '@scure/btc-signer';
import { request } from 'undici';

import { Network } from 'nb-types';

import config from '#config';
import { NotFoundError, RateLimitError, RpcError } from '#libs/errors';
import {
  BitcoinBlock,
  BitcoinRpcRequest,
  BitcoinRpcResponse,
} from '#types/types';

const network = config.network === Network.MAINNET ? NETWORK : TEST_NETWORK;

export const rpcCall = async <T>(
  url: string,
  method: string,
  params: unknown[] = [],
): Promise<T> => {
  const payload: BitcoinRpcRequest = {
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

  const json = (await body.json()) as BitcoinRpcResponse<T>;

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
): Promise<BitcoinBlock> => {
  const blockHash = await rpcCall<string>(url, 'getblockhash', [height]);

  return rpcCall<BitcoinBlock>(url, 'getblock', [blockHash, 2]);
};

export const pubKeyToP2PKH = (pubKeyHex: string): string => {
  const pubKeyBuffer = Buffer.from(pubKeyHex, 'hex');

  return p2pkh(pubKeyBuffer, network).address;
};

export const pubKeyToP2WPKH = (pubKeyHex: string): string => {
  const pubKeyBuffer = Buffer.from(pubKeyHex, 'hex');

  return p2wpkh(pubKeyBuffer, network).address;
};
