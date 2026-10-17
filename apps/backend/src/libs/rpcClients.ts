import { NearRpcClient } from '@near-js/jsonrpc-client/no-validation';

import { logger } from 'nb-logger';
import { RPC as NearRPC } from 'nb-near';
import {
  isRetryableRpcFailure,
  isSoftEndpointFailure,
  isTransportTimeout,
  RpcFailover,
  sleep,
} from 'nb-utils';

type QueryParams = {
  method_name?: string;
  methodName?: string;
  request_type?: string;
  requestType?: string;
};

export type RpcEndpoint = {
  authToken: string;
  url: string;
};

export type RpcClientOptions = {
  failover?: RpcFailover;
  /** Short pause before the single quick retry on the primary. */
  primaryRetryDelayMs?: number;
  recordCall?: (path: string, attempt: number, ok: boolean) => void;
  timeoutMs?: number;
};

const authorizationHeaders = (authToken: string) =>
  authToken ? { Authorization: `Bearer ${authToken}` } : undefined;

const RPC_RETRIES = 3;
const PRIMARY_RETRY_DELAY_MS = 300;
const RPC_TIMEOUT_MS = 30_000;

const logFallback = (error: unknown, endpoint: string) =>
  logger.warn(
    { endpoint, error: error ? String(error) : undefined },
    'using configured RPC fallback',
  );

/**
 * Whether to retry the same endpoint. A lone endpoint keeps the full backoff
 * schedule. With fallbacks configured, the primary gets one quick retry for
 * transport errors before the request moves on. Missing-history failures are
 * never retried; the next endpoint is tried straight away.
 */
const retryDelayMs = (
  index: number,
  endpointCount: number,
  error: unknown,
  endpointAttempt: number,
  quickDelayMs: number,
): number | undefined => {
  if (index !== 0 || !isRetryableRpcFailure(error)) return undefined;
  // Never hammer a rate-limited endpoint with retries; move on or give up.
  if (isRateLimited(error)) return undefined;
  if (endpointCount === 1)
    return endpointAttempt <= RPC_RETRIES
      ? Math.pow(2, endpointAttempt - 1) * 1000
      : undefined;
  // A timeout already cost the full wait: go to the fallback now.
  if (isTransportTimeout(error)) return undefined;
  return endpointAttempt <= 1 ? quickDelayMs : undefined;
};

const isRateLimited = (error: unknown): boolean => {
  const value = error as {
    message?: unknown;
    response?: { status?: unknown };
    status?: unknown;
  } | null;
  return (
    value?.status === 429 ||
    value?.response?.status === 429 ||
    (typeof value?.message === 'string' &&
      value.message.includes('status: 429'))
  );
};

/**
 * Carries a 200 response whose body is a node answer another endpoint may
 * serve instead (missing history, a slow query, not synced).
 */
class SoftAnswerResponse extends Error {
  readonly error: unknown;
  readonly response: unknown;

  constructor(response: unknown, error: unknown) {
    super('RPC endpoint could not serve this request');
    this.error = error;
    this.response = response;
  }
}

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
  private readonly clients: NearRpcClient[];
  private readonly failover: RpcFailover;
  private readonly options: RpcClientOptions;

  constructor(endpoints: RpcEndpoint[], options: RpcClientOptions = {}) {
    super({
      endpoint: endpoints[0].url,
      headers: authorizationHeaders(endpoints[0].authToken),
      timeout: options.timeoutMs ?? RPC_TIMEOUT_MS,
    });
    Object.assign(this, { retries: 0 });
    this.failover = options.failover ?? new RpcFailover();
    this.options = options;
    this.clients = endpoints.map(({ authToken, url }) => {
      const client = new NearRpcClient({
        endpoint: url,
        headers: authorizationHeaders(authToken),
        timeout: options.timeoutMs ?? RPC_TIMEOUT_MS,
      });
      Object.assign(client, { retries: 0 });
      return client;
    });
  }

  async makeRequest<TParams = unknown, TResult = unknown>(
    method: string,
    params?: TParams,
  ): Promise<TResult> {
    const path = callPath(method, params);
    const recordCall = this.options.recordCall ?? (() => undefined);
    let attempt = 0;

    return this.failover.run(
      this.clients.map((client, index) => ({
        name: `rpc-${index}`,
        request: async () => {
          let endpointAttempt = 0;
          for (;;) {
            attempt += 1;
            endpointAttempt += 1;
            try {
              const result = await client.makeRequest<TParams, TResult>(
                method,
                params,
              );
              recordCall(path, attempt, true);
              return result;
            } catch (error) {
              recordCall(path, attempt, false);
              const delay = retryDelayMs(
                index,
                this.clients.length,
                error,
                endpointAttempt,
                this.options.primaryRetryDelayMs ?? PRIMARY_RETRY_DELAY_MS,
              );
              if (delay === undefined) throw error;
              await sleep(delay);
            }
          }
        },
      })),
      logFallback,
    );
  }
}

class CountedAxiosRpc extends NearRPC {
  private readonly clients: NearRPC[];
  private readonly failover: RpcFailover;
  private readonly options: RpcClientOptions;

  constructor(endpoints: RpcEndpoint[], options: RpcClientOptions = {}) {
    super(endpoints[0].url);
    this.failover = options.failover ?? new RpcFailover();
    this.options = options;
    this.clients = endpoints.map(({ authToken, url }) => {
      const client = new NearRPC(url);
      client.request.defaults.timeout = options.timeoutMs ?? RPC_TIMEOUT_MS;
      if (authToken) {
        client.request.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      }
      return client;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query(params: unknown, method = 'query'): Promise<any> {
    const path = callPath(method, params);
    const recordCall = this.options.recordCall ?? (() => undefined);
    let attempt = 0;

    try {
      return await this.failover.run(
        this.clients.map((client, index) => ({
          name: `rpc-${index}`,
          request: async () => {
            let endpointAttempt = 0;
            for (;;) {
              attempt += 1;
              endpointAttempt += 1;
              try {
                const response = await client.query(params, method);
                const body = response.data as { error?: unknown } | undefined;
                recordCall(path, attempt, !body?.error);
                // The node answers 200 with a JSON-RPC error when it lacks
                // the block, times out or is not synced; let the next
                // endpoint try, without penalty.
                if (body?.error && isSoftEndpointFailure(body))
                  throw new SoftAnswerResponse(response, body.error);
                return response;
              } catch (error) {
                if (error instanceof SoftAnswerResponse) throw error;
                recordCall(path, attempt, false);
                const delay = retryDelayMs(
                  index,
                  this.clients.length,
                  error,
                  endpointAttempt,
                  this.options.primaryRetryDelayMs ?? PRIMARY_RETRY_DELAY_MS,
                );
                if (delay === undefined) throw error;
                await sleep(delay);
              }
            }
          },
        })),
        logFallback,
      );
    } catch (error) {
      // Every endpoint gave such an answer: hand back the last node's own
      // response, as callers expect a 200 carrying the JSON-RPC error body.
      // RpcFailover throws an AggregateError instead when any endpoint was
      // unavailable, and that outage is surfaced as-is.
      if (error instanceof SoftAnswerResponse) return error.response;
      throw error;
    }
  }
}

export { CountedAxiosRpc, CountedRpcClient };
