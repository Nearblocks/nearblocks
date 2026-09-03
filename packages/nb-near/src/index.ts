import axios, { AxiosInstance } from 'axios';
import { validators } from 'near-api-js';

import { retry } from 'nb-utils';

export * from './types.js';

export const validatorApi = validators;

export type ViewCall = { errorName: string; result: null | number[] };

export type RpcErrorBody = {
  error?: { cause?: { name?: string }; data?: string; message?: string };
};

export const REJECT_MARKERS = [
  'methodnotfound',
  'methodresolveerror',
  'compilationerror',
  'wasmerruntimeerror',
  'functioncallerror',
  'contract_execution_error',
  'codedoesnotexist',
  'unknown_account',
  'no_contract_code',
];

export const ABSENT_MARKERS = [
  'methodnotfound',
  'methodresolveerror',
  'codedoesnotexist',
  'unknown_account',
  'no_contract_code',
];

const describeRpcErrorBody = (data: unknown): string | undefined => {
  const body = data as RpcErrorBody | undefined;
  return body?.error?.cause?.name ?? body?.error?.data ?? body?.error?.message;
};

export const callView = async (
  rpc: RPC,
  contract: string,
  method: string,
  args: unknown,
  blockHeight: number,
): Promise<ViewCall> => {
  try {
    const res = await retry(
      () =>
        rpc.callFunction(contract, method, rpc.encodeArgs(args), blockHeight),
      { exponential: true, retries: 5 },
    );

    const data = res.data as {
      error?: { cause?: { name?: string }; message?: string };
      result?: { error?: string; result?: number[] };
    };

    if (data?.result?.result)
      return { errorName: '', result: data.result.result };

    const errorName = String(
      data?.result?.error ||
        data?.error?.cause?.name ||
        data?.error?.message ||
        '',
    ).toLowerCase();

    return { errorName, result: null };
  } catch {
    return { errorName: 'rpc_error', result: null };
  }
};

export const fetchBalance = async (
  rpc: RPC,
  contract: string,
  account: string,
  blockHeight: number,
): Promise<{ balance: bigint | null; errorName: string }> => {
  const { errorName, result } = await callView(
    rpc,
    contract,
    'ft_balance_of',
    { account_id: account },
    blockHeight,
  );

  if (!result) return { balance: null, errorName };

  try {
    return {
      balance: BigInt(JSON.parse(Buffer.from(result).toString())),
      errorName: '',
    };
  } catch {
    return { balance: null, errorName: 'parse_error' };
  }
};

export const checkArchival = async (
  rpc: RPC,
  contract: string,
  blockHeight: number,
): Promise<void> => {
  try {
    const res = await retry(
      () =>
        rpc.query(
          {
            account_ids: [contract],
            block_id: blockHeight,
            changes_type: 'data_changes',
            key_prefix_base64: '',
          },
          'EXPERIMENTAL_changes',
        ),
      { exponential: true, retries: 5 },
    );

    const changes = res.data?.result?.changes;

    if (!changes) {
      throw new Error(describeRpcErrorBody(res.data) ?? 'no changes');
    }
  } catch (error) {
    throw new Error(
      `RPC_URL must point at an archival node, reading block ${blockHeight} ` +
        `failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export class RPC {
  request: AxiosInstance;

  constructor(baseURL: string) {
    this.request = axios.create({ baseURL });
  }

  async callFunction(
    contractId: string,
    methodName: string,
    args: string,
    blockId?: number | string,
  ) {
    const params = {
      account_id: contractId,
      args_base64: args,
      method_name: methodName,
      request_type: 'call_function',
    };

    if (blockId) {
      return this.query({ ...params, block_id: blockId });
    }

    return this.query({ ...params, finality: 'final' });
  }

  decodeResult<T>(...args: Parameters<typeof Buffer.from>): T {
    return JSON.parse(Buffer.from(...args).toString());
  }

  encodeArgs(args: unknown, encoding: BufferEncoding = 'base64') {
    return Buffer.from(JSON.stringify(args)).toString(encoding);
  }

  async query(params: unknown, method = 'query') {
    return this.request.post('', {
      id: 'near',
      jsonrpc: '2.0',
      method,
      params,
    });
  }

  async viewAccount(accountId: string, blockId: number | string) {
    return this.query({
      account_id: accountId,
      block_id: blockId,
      request_type: 'view_account',
    });
  }

  async viewState(accountId: string, blockId: number | string, prefix = '') {
    return this.query({
      account_id: accountId,
      block_id: blockId,
      prefix_base64: prefix,
      request_type: 'view_state',
    });
  }
}
