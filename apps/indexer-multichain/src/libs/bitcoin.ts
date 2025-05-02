import { randomBytes } from 'crypto';
import { request } from 'undici';

import { NETWORK, p2pkh, p2wpkh, TEST_NETWORK } from '@scure/btc-signer';

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

  const json = (await body.json()) as BitcoinRpcResponse<T>;

  if (!json.result) {
    throw new NotFoundError('block not found');
  }

  if (json.error) {
    throw new Error(json.error.message);
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

export const decodeDERsignature = (signatureHex: string) => {
  const signature = Buffer.from(signatureHex, 'hex');

  const der = signature.subarray(0, signature.length - 1);

  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('invalid DER format');

  const length = der[offset++];

  if (length + 2 !== der.length) throw new Error('invalid length');
  if (der[offset++] !== 0x02) throw new Error('expected integer for r');

  const rLen = der[offset++];
  const r = der.subarray(offset + 1, offset + rLen);
  offset += rLen;

  if (der[offset++] !== 0x02) throw new Error('expected integer for s');

  const sLen = der[offset++];
  const s = der.subarray(offset, offset + sLen);

  return { r, s };
};

export const pubKeyToP2PKH = (pubKeyHex: string): string => {
  const pubKeyBuffer = Buffer.from(pubKeyHex, 'hex');

  return p2pkh(pubKeyBuffer, network).address;
};

export const pubKeyToP2WPKH = (pubKeyHex: string): string => {
  const pubKeyBuffer = Buffer.from(pubKeyHex, 'hex');

  return p2wpkh(pubKeyBuffer, network).address;
};
