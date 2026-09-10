import { NearRpcClient } from '@near-js/jsonrpc-client/no-validation';
import axios from 'axios';

import { RPC as NearRPC } from 'nb-near';
import { sleep } from 'nb-utils';

import config from '#config';
import { recordRpcCall } from '#libs/rpcCounter';

type QueryParams = {
  method_name?: string;
  methodName?: string;
  request_type?: string;
  requestType?: string;
};

const NETWORK_ERROR = 'JsonRpcNetworkError';
const RPC_RETRIES = 3;

const callPath = (method: string, params: unknown) => {
  if (method !== 'query') return method;

  const query = params as QueryParams | undefined;
  const requestType = query?.requestType ?? query?.request_type;

  if (!requestType) return method;

  const methodName = query?.methodName ?? query?.method_name;

  return methodName
    ? `${method}/${requestType}/${methodName}`
    : `${method}/${requestType}`;
};

class CountedRpcClient extends NearRpcClient {
  constructor(endpoint: string) {
    super({ endpoint });
    Object.assign(this, { retries: 0 });
  }

  async makeRequest<TParams = unknown, TResult = unknown>(
    method: string,
    params?: TParams,
  ): Promise<TResult> {
    const path = callPath(method, params);
    let attempt = 0;

    for (;;) {
      attempt += 1;

      try {
        const result = await super.makeRequest<TParams, TResult>(
          method,
          params,
        );

        recordRpcCall(path, attempt, true);

        return result;
      } catch (error) {
        recordRpcCall(path, attempt, false);

        const retriable =
          (error as Error)?.name === NETWORK_ERROR && attempt <= RPC_RETRIES;

        if (!retriable) throw error;

        await sleep(Math.pow(2, attempt - 1) * 1000);
      }
    }
  }
}

class CountedAxiosRpc extends NearRPC {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query(params: unknown, method = 'query'): Promise<any> {
    const path = callPath(method, params);
    let attempt = 0;

    for (;;) {
      attempt += 1;

      try {
        const response = await super.query(params, method);
        const body = response.data as { error?: unknown } | undefined;

        recordRpcCall(path, attempt, !body?.error);

        return response;
      } catch (error) {
        recordRpcCall(path, attempt, false);

        const rateLimited =
          axios.isAxiosError(error) && error.response?.status === 429;
        const retriable = !rateLimited && attempt <= RPC_RETRIES;

        if (!retriable) throw error;

        await sleep(Math.pow(2, attempt - 1) * 1000);
      }
    }
  }
}

export const rpc = new CountedRpcClient(config.rpcUrl);

export const axiosRpc = new CountedAxiosRpc(config.rpcUrl);
axiosRpc.request.defaults.timeout = 30_000;
