import { providers } from 'near-api-js';
import { parseRpcError } from 'near-api-js/lib/utils/rpc_errors.js';

import {
  isRetryableRpcFailure,
  isTransportTimeout,
  RpcFailover,
  sleep,
} from 'nb-utils';

import { recordRpcAttempt } from '#libs/promMetrics';

export const RPC_REQUEST_TIMEOUT_MS = 15_000;
const RPC_RETRIES = 3;
const PRIMARY_RETRY_DELAY_MS = 300;

export type RpcEndpoint = {
  authToken: string;
  name?: string;
  url: string;
};

export type FailoverProviderOptions = {
  failover?: RpcFailover;
  onFallback?: (error: unknown, endpoint: string) => void;
  /** Base delay for retries on the primary endpoint. */
  retryDelayMs?: number;
  timeoutMs?: number;
};

/**
 * Delay before retrying the same endpoint, or undefined to stop. A lone
 * endpoint keeps the retries near-api-js used to provide; with fallbacks the
 * primary gets one quick retry before the request moves on. Rate limits are
 * never retried.
 */
const retryDelay = (
  index: number,
  endpointCount: number,
  error: unknown,
  attempt: number,
  baseMs: number,
): number | undefined => {
  if (index !== 0 || !isRetryableRpcFailure(error)) return undefined;
  if ((error as { status?: unknown } | null)?.status === 429) return undefined;
  if (endpointCount === 1)
    return attempt <= RPC_RETRIES ? baseMs * 2 ** (attempt - 1) : undefined;
  // A timeout already cost the full wait: go to the fallback now.
  if (isTransportTimeout(error)) return undefined;
  return attempt <= 1 ? baseMs : undefined;
};

type JsonRpcResponse = {
  error?: {
    code?: number;
    data?: unknown;
    message?: string;
    name?: string;
  } & Record<string, unknown>;
  result?: unknown;
};

let nextId = 123;

/** Map a JSON-RPC error body to the error shapes near-api-js produces. */
const rpcBodyError = (error: NonNullable<JsonRpcResponse['error']>): Error => {
  const data = error.data as Record<string, unknown> | string | undefined;
  if (typeof data === 'object' && data !== null) {
    if (
      typeof data.error_message === 'string' &&
      typeof data.error_type === 'string'
    ) {
      // Old-format node error.
      return new providers.TypedError(data.error_message, data.error_type);
    }
    return parseRpcError(data);
  }

  const message = `[${error.code}] ${error.message}: ${data}`;
  const isTimeout =
    data === 'Timeout' ||
    message.includes('Timeout error') ||
    message.includes('query has timed out');
  // `cause` keeps the structured node error name (for example UNKNOWN_BLOCK)
  // that near-api-js would otherwise drop.
  return Object.assign(
    new providers.TypedError(
      message,
      isTimeout ? 'TimeoutError' : (error.name as string),
    ),
    { cause: error.cause },
  );
};

const postJsonRpc = async (
  endpoint: RpcEndpoint,
  method: string,
  params: object,
  timeoutMs: number,
): Promise<unknown> => {
  // near-api-js replaces the global fetch with node-fetch when it is loaded, so
  // only rely on behaviour both implementations share.
  const signal = AbortSignal.timeout(timeoutMs);
  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(endpoint.url, {
      body: JSON.stringify({
        id: nextId++,
        jsonrpc: '2.0',
        method,
        params,
      }),
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint.authToken
          ? { Authorization: `Bearer ${endpoint.authToken}` }
          : {}),
      },
      method: 'POST',
      signal,
    });
  } catch (error) {
    if (signal.aborted)
      throw Object.assign(
        new Error(`RPC request timed out after ${timeoutMs}ms`, {
          cause: error,
        }),
        { name: 'TimeoutError' },
      );
    throw error;
  }

  if (!response.ok) {
    await response.text().catch(() => undefined);
    throw Object.assign(new Error(`HTTP error! status: ${response.status}`), {
      status: response.status,
    });
  }

  let body: JsonRpcResponse;
  try {
    body = (await response.json()) as JsonRpcResponse;
  } catch (error) {
    throw new Error('network error: invalid JSON-RPC response', {
      cause: error,
    });
  }

  if (body.error) throw rpcBodyError(body.error);
  if (typeof body.result === 'undefined')
    throw new Error('network error: JSON-RPC response has no result');

  return body.result;
};

/**
 * JSON-RPC provider that tries endpoints in priority order. It performs the
 * request itself (bounded by a timeout, no internal retry loop) so a dead or
 * hung primary hands over to the next endpoint promptly.
 */
export class FailoverJsonRpcProvider extends providers.JsonRpcProvider {
  private readonly endpoints: RpcEndpoint[];
  private readonly failover: RpcFailover;
  private readonly onFallback?: FailoverProviderOptions['onFallback'];
  private readonly retryDelayMs?: number;
  private readonly timeoutMs: number;

  constructor(endpoints: RpcEndpoint[], options: FailoverProviderOptions = {}) {
    super({ url: endpoints[0].url });
    this.endpoints = endpoints;
    this.failover = options.failover ?? new RpcFailover();
    this.onFallback = options.onFallback;
    this.retryDelayMs = options.retryDelayMs;
    this.timeoutMs = options.timeoutMs ?? RPC_REQUEST_TIMEOUT_MS;
  }

  async sendJsonRpc<T>(method: string, params: object): Promise<T> {
    return this.failover.run(
      this.endpoints.map((endpoint, index) => {
        const endpointName =
          endpoint.name ?? (index === 0 ? 'primary' : `fallback_${index}`);

        return {
          name: endpointName,
          request: async () => {
            const single = this.endpoints.length === 1;
            const baseMs =
              this.retryDelayMs ?? (single ? 1000 : PRIMARY_RETRY_DELAY_MS);
            for (let attempt = 1; ; attempt++) {
              const startedAt = process.hrtime.bigint();
              try {
                const result = await postJsonRpc(
                  endpoint,
                  method,
                  params,
                  this.timeoutMs,
                );
                recordRpcAttempt(
                  endpointName,
                  method,
                  'success',
                  Number(process.hrtime.bigint() - startedAt) / 1e9,
                );
                return result as T;
              } catch (error) {
                recordRpcAttempt(
                  endpointName,
                  method,
                  'error',
                  Number(process.hrtime.bigint() - startedAt) / 1e9,
                );
                const delay = retryDelay(
                  index,
                  this.endpoints.length,
                  error,
                  attempt,
                  baseMs,
                );
                if (delay === undefined) throw error;
                await sleep(delay);
              }
            }
          },
        };
      }),
      this.onFallback,
    );
  }
}
