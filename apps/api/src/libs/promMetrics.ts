import client from 'prom-client';

import {
  isMissingHistoryFailure,
  isNodeNotReady,
  isRetryableRpcFailure,
  isTransportTimeout,
} from 'nb-utils';

export const register = new client.Registry();

register.setDefaultLabels({
  network: process.env.NETWORK ?? 'unknown',
  service: 'api',
});

export const rpcRequests = new client.Counter({
  help: 'JSON-RPC HTTP attempts made by the API, by configured endpoint and method',
  labelNames: ['endpoint', 'method', 'result'] as const,
  name: 'nearblocks_api_rpc_requests_total',
  registers: [register],
});

export const rpcRequestDuration = new client.Histogram({
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 15],
  help: 'Duration of JSON-RPC HTTP attempts in seconds',
  labelNames: ['endpoint', 'method'] as const,
  name: 'nearblocks_api_rpc_request_duration_seconds',
  registers: [register],
});

export const rpcFallbacks = new client.Counter({
  help: 'JSON-RPC requests for which the API proceeds to a fallback endpoint',
  labelNames: ['endpoint', 'reason'] as const,
  name: 'nearblocks_api_rpc_fallbacks_total',
  registers: [register],
});

export const recordRpcAttempt = (
  endpoint: string,
  method: string,
  result: 'error' | 'success',
  durationSeconds: number,
) => {
  rpcRequests.inc({ endpoint, method, result });
  rpcRequestDuration.observe({ endpoint, method }, durationSeconds);
};

export const getRpcFallbackReason = (error: unknown): string => {
  if (!error) return 'circuit_open';
  if (isMissingHistoryFailure(error)) return 'missing_history';
  if (isNodeNotReady(error)) return 'node_not_ready';
  if (isTransportTimeout(error)) return 'timeout';

  const value = error as {
    response?: { status?: unknown };
    status?: unknown;
  };
  const status = value.status ?? value.response?.status;
  if (status === 429) return 'rate_limited';
  if (status === 408) return 'timeout';
  if (typeof status === 'number' && status >= 500) return 'server_error';
  if (isRetryableRpcFailure(error)) return 'transport_error';
  return 'other';
};
