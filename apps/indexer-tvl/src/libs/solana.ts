import { request } from 'undici';

import { NotFoundError, RateLimitError, RpcError } from '#libs/errors';
import {
  SolanaRpcRequest,
  SolanaRpcResponse,
  SolanaSignatureInfo,
  SolanaTokenAccount,
  SolanaTransaction,
} from '#types/types';

const ERROR_CODES = new Set([-32001, -32007, -32009]); // slot skipped / not available

const TOKEN_PROGRAMS = [
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
];

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

  const json = (await body.json()) as SolanaRpcResponse<T>;

  if (json.error) {
    if (options.allowNull && ERROR_CODES.has(json.error.code)) {
      return null as T;
    }

    throw new RpcError(json.error.message);
  }

  if (json.result === undefined) {
    throw new NotFoundError(`empty result for ${method}`);
  }

  return json.result as T;
};

export const getSignaturesForAddress = async (
  url: string,
  address: string,
  options: { before?: string; limit: number; until?: string },
): Promise<SolanaSignatureInfo[]> => {
  return rpcCall<SolanaSignatureInfo[]>(url, 'getSignaturesForAddress', [
    address,
    {
      before: options.before,
      limit: options.limit,
      until: options.until,
    },
  ]);
};

type TokenAccountsResponse = {
  value: {
    account: {
      data: {
        parsed: { info: { mint: string; tokenAmount: { decimals: number } } };
      };
    };
    pubkey: string;
  }[];
};

export const getTokenAccountsByOwner = async (
  url: string,
  owner: string,
): Promise<SolanaTokenAccount[]> => {
  const results = await Promise.all(
    TOKEN_PROGRAMS.map((programId) =>
      rpcCall<TokenAccountsResponse>(url, 'getTokenAccountsByOwner', [
        owner,
        { programId },
        { encoding: 'jsonParsed' },
      ]),
    ),
  );

  return results.flatMap((r) =>
    r.value.map((entry) => ({
      decimals: entry.account.data.parsed.info.tokenAmount.decimals,
      mint: entry.account.data.parsed.info.mint,
      pubkey: entry.pubkey,
    })),
  );
};

export const getTransaction = async (
  url: string,
  signature: string,
): Promise<null | SolanaTransaction> => {
  return rpcCall<null | SolanaTransaction>(
    url,
    'getTransaction',
    [
      signature,
      {
        encoding: 'json',
        maxSupportedTransactionVersion: 0,
      },
    ],
    { allowNull: true },
  );
};
