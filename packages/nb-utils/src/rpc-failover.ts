const RETRYABLE_CODES = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENOTFOUND',
  'EPIPE',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
]);

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const MISSING_HISTORY_NAMES = new Set([
  'garbagecollectedblock',
  'unknownblock',
]);

const MISSING_HISTORY_TEXT =
  /GARBAGE_COLLECTED_BLOCK|UNKNOWN_BLOCK|DB Not Found Error: BLOCK HEIGHT|has been garbage collected/i;

const HTTP_FAILURE_MESSAGE = /HTTP error! status: (?:401|403|408|429|5\d\d)/;

const normalizeName = (value: unknown): string | undefined =>
  typeof value === 'string'
    ? value.replaceAll('_', '').toLowerCase()
    : undefined;

const isAggregate = (value: Record<string, unknown> | undefined): boolean =>
  value?.name === 'AggregateError' && Array.isArray(value.errors);

const NODE_NOT_READY_NAMES = new Set(['notsyncedyet', 'unavailableshard']);

const NODE_NOT_READY_TEXT =
  /NOT_SYNCED_YET|UNAVAILABLE_SHARD|no fully synchronized blocks|does not track the shard/i;

const NODE_TIMEOUT_TEXT = /query has timed out|Timeout error/i;

/** Error names a node put in its JSON-RPC answer, across client shapes. */
const answerNames = (value: Record<string, unknown>): unknown[] => {
  const data = asRecord(value.data);
  const body = asRecord(value.error);
  return [
    value.type,
    data?.name,
    asRecord(data?.cause)?.name,
    asRecord(body?.cause)?.name,
    body?.name,
  ];
};

/** Free-text fields of a node answer (plus the error message). */
const answerTexts = (value: Record<string, unknown>): unknown[] => {
  const body = asRecord(value.error);
  return [value.data, body?.data, body?.message, value.message];
};

/** Matches a node answer by structured name or by text; aggregates need all. */
const matchesAnswer = (
  error: unknown,
  names: Set<string>,
  text: RegExp,
  includeCause: boolean,
): boolean => {
  const value = asRecord(error);
  if (!value) return false;
  if (isAggregate(value)) {
    const errors = value.errors as unknown[];
    // Only when every endpoint gave this answer. An outage on any of them
    // means the request might still succeed, so the aggregate does not count.
    return (
      errors.length > 0 &&
      errors.every((item) => matchesAnswer(item, names, text, includeCause))
    );
  }
  const candidates = answerNames(value);
  // near-api-js-shaped errors from the API provider keep the node's cause
  // here. Transport errors also have a cause (the fetch failure), so only
  // look at it for answers that cannot be confused with one.
  if (includeCause) candidates.push(asRecord(value.cause)?.name);
  if (candidates.some((name) => names.has(normalizeName(name)!))) return true;
  return answerTexts(value).some(
    (item) => typeof item === 'string' && text.test(item),
  );
};

/**
 * True when the endpoint answered that it lacks the requested block, which
 * happens for old heights on a non-archival node. The endpoint is healthy; a
 * deeper-history endpoint may still be able to answer.
 */
export const isMissingHistoryFailure = (error: unknown): boolean =>
  matchesAnswer(error, MISSING_HISTORY_NAMES, MISSING_HISTORY_TEXT, true);

/**
 * True when the node answered that it cannot serve requests yet (still
 * syncing) or does not track the shard. Another endpoint may answer.
 */
export const isNodeNotReady = (error: unknown): boolean =>
  matchesAnswer(error, NODE_NOT_READY_NAMES, NODE_NOT_READY_TEXT, true);

export const isRetryableRpcFailure = (error: unknown): boolean => {
  const value = asRecord(error);
  if (isAggregate(value))
    return (value!.errors as unknown[]).every(isRetryableRpcFailure);
  const cause = asRecord(value?.cause);
  const response = asRecord(value?.response);
  const status = value?.status ?? value?.statusCode ?? response?.status;

  if (typeof status === 'number') {
    // 401/403: a wrong or rotated key on this endpoint. Fall back rather than
    // fail every request; the circuit and fallback log make it visible.
    return [401, 403, 408, 429].includes(status) || status >= 500;
  }

  const code = value?.code ?? cause?.code;
  if (typeof code === 'string' && RETRYABLE_CODES.has(code)) return true;

  const name = value?.name;
  const message = value?.message;

  return (
    name === 'JsonRpcNetworkError' ||
    // A "JSON-RPC error" without a numeric code is a non-JSON-RPC error body
    // (for example a gateway's `{"error":"unavailable"}` on 5xx), not a node
    // answer.
    (name === 'JsonRpcClientError' && typeof value?.code !== 'number') ||
    name === 'TimeoutError' ||
    (typeof message === 'string' &&
      (HTTP_FAILURE_MESSAGE.test(message) ||
        /fetch failed|network error|socket hang up/i.test(message)))
  );
};

/**
 * True when the request to the endpoint timed out (no answer at all). With a
 * fallback configured this should go straight to the next endpoint: retrying
 * the same endpoint would double the wait.
 */
export const isTransportTimeout = (error: unknown): boolean => {
  const value = asRecord(error);
  if (!value) return false;
  const code = value.code ?? asRecord(value.cause)?.code;
  const message = value.message;
  return (
    value.name === 'TimeoutError' ||
    code === 'ECONNABORTED' ||
    code === 'UND_ERR_CONNECT_TIMEOUT' ||
    (typeof message === 'string' &&
      /operation was aborted|timeout of \d+ms exceeded|timed out after/i.test(
        message,
      ))
  );
};

/**
 * True when the node itself answered that the query timed out (a JSON-RPC
 * error mapped to type `TimeoutError`, as near-api-js does). That is one slow
 * query, not an unhealthy endpoint. Transport timeouts use the error name
 * instead and stay in isRetryableRpcFailure.
 */
export const isNodeQueryTimeout = (error: unknown): boolean => {
  const value = asRecord(error);
  if (!value) return false;
  if (isAggregate(value)) {
    const errors = value.errors as unknown[];
    return errors.length > 0 && errors.every(isNodeQueryTimeout);
  }
  if (value.type === 'TimeoutError') return true;
  // Backend clients: the node's JSON-RPC answer, never the transport error
  // (which is named TimeoutError but carries no answer data).
  const body = asRecord(value.error);
  return (
    answerNames(value).some((name) => normalizeName(name) === 'timeouterror') ||
    [value.data, body?.data].some(
      (item) =>
        typeof item === 'string' &&
        (item === 'Timeout' || NODE_TIMEOUT_TEXT.test(item)),
    )
  );
};

/** The endpoint answered but could not serve this request; it stays healthy. */
export const isSoftEndpointFailure = (error: unknown): boolean =>
  isMissingHistoryFailure(error) ||
  isNodeQueryTimeout(error) ||
  isNodeNotReady(error);

/** Whether the next configured endpoint should be tried after this failure. */
export const shouldTryNextRpcEndpoint = (error: unknown): boolean =>
  isRetryableRpcFailure(error) || isSoftEndpointFailure(error);

export const withRpcFallback = async <T>(
  primary: () => Promise<T>,
  fallbacks: Array<() => Promise<T>> = [],
  onFallback?: (error: unknown, endpointIndex: number) => void,
): Promise<T> => {
  try {
    return await primary();
  } catch (primaryError) {
    if (!fallbacks.length || !shouldTryNextRpcEndpoint(primaryError))
      throw primaryError;

    const errors = [primaryError];
    for (const [index, fallback] of fallbacks.entries()) {
      onFallback?.(errors.at(-1), index + 1);
      try {
        return await fallback();
      } catch (fallbackError) {
        if (!shouldTryNextRpcEndpoint(fallbackError)) throw fallbackError;
        errors.push(fallbackError);
      }
    }

    throw new AggregateError(
      errors,
      'RPC primary and fallback endpoints failed',
      { cause: errors.at(-1) },
    );
  }
};

export type RpcEndpoint<T> = {
  name: string;
  request: () => Promise<T>;
};

type CircuitState = {
  failures: number;
  openUntil: number;
};

export type RpcFailoverOptions = {
  cooldownMs?: number;
  maxCooldownMs?: number;
  now?: () => number;
};

/** Ordered RPC failover with an in-memory circuit breaker per endpoint. */
export class RpcFailover {
  private readonly circuits = new Map<string, CircuitState>();
  private readonly cooldownMs: number;
  private readonly maxCooldownMs: number;
  private readonly now: () => number;

  constructor(options: RpcFailoverOptions = {}) {
    this.cooldownMs = options.cooldownMs ?? 30_000;
    // Short enough that traffic returns to a recovered primary within a
    // minute; each probe of a still-dead endpoint costs one failed request.
    this.maxCooldownMs = options.maxCooldownMs ?? 60_000;
    this.now = options.now ?? Date.now;
  }

  async run<T>(
    endpoints: RpcEndpoint<T>[],
    onFallback?: (error: unknown, endpoint: string) => void,
  ): Promise<T> {
    if (!endpoints.length)
      throw new Error('At least one RPC endpoint is required.');

    const now = this.now();
    const available = endpoints.filter((endpoint) => {
      const circuit = this.circuits.get(endpoint.name);
      return !circuit || circuit.openUntil <= now;
    });
    const ordered = available.length
      ? available
      : [
          endpoints.reduce((earliest, endpoint) => {
            const earliestState = this.circuits.get(earliest.name);
            const endpointState = this.circuits.get(endpoint.name);
            return (endpointState?.openUntil ?? 0) <
              (earliestState?.openUntil ?? 0)
              ? endpoint
              : earliest;
          }),
        ];

    const errors: unknown[] = [];
    if (ordered[0]?.name !== endpoints[0]?.name)
      onFallback?.(undefined, ordered[0]?.name ?? 'unknown');

    // Returns the result, or records the failure and returns undefined.
    const attempt = async (
      endpoint: RpcEndpoint<T>,
    ): Promise<{ result: T } | undefined> => {
      try {
        const result = await endpoint.request();
        this.circuits.delete(endpoint.name);
        return { result };
      } catch (error) {
        if (isSoftEndpointFailure(error)) {
          // The endpoint is healthy but could not serve this request (missing
          // history, a slow query, not synced): try the next one, no penalty.
          this.circuits.delete(endpoint.name);
          errors.push(error);
          return undefined;
        }
        if (!isRetryableRpcFailure(error)) {
          this.circuits.delete(endpoint.name);
          throw error;
        }
        this.recordFailure(endpoint.name);
        errors.push(error);
        return undefined;
      }
    };

    for (const [index, endpoint] of ordered.entries()) {
      if (index > 0) onFallback?.(errors.at(-1), endpoint.name);
      const outcome = await attempt(endpoint);
      if (outcome) return outcome.result;
    }

    // Every endpoint tried answered (block unavailable, query timed out, not
    // synced) but some were skipped for an open circuit. Their answer may
    // differ (an archival fallback has old blocks), so try them before
    // reporting the request as unanswerable.
    if (errors.length > 0 && errors.every(isSoftEndpointFailure)) {
      const tried = new Set(ordered.map((endpoint) => endpoint.name));
      for (const endpoint of endpoints) {
        if (tried.has(endpoint.name)) continue;
        onFallback?.(errors.at(-1), endpoint.name);
        const outcome = await attempt(endpoint);
        if (outcome) return outcome.result;
      }
    }

    // Every endpoint gave an application answer: surface the last one as-is.
    // If any endpoint was unreachable instead, report the outage; a
    // missing-history answer from the others must not make data look absent.
    if (errors.length > 0 && errors.every(isSoftEndpointFailure))
      throw errors.at(-1);
    throw new AggregateError(errors, 'All RPC endpoints failed', {
      cause: errors.at(-1),
    });
  }

  /**
   * Open (or extend) the circuit. Failures while it is already open are one
   * incident, not more: concurrent requests failing in the same blip would
   * otherwise escalate the cooldown straight to the maximum.
   */
  private recordFailure(name: string): void {
    const now = this.now();
    const previous = this.circuits.get(name);
    if (previous && previous.openUntil > now) return;
    const failures = (previous?.failures ?? 0) + 1;
    const cooldown = Math.min(
      this.cooldownMs * 2 ** (failures - 1),
      this.maxCooldownMs,
    );
    this.circuits.set(name, { failures, openUntil: now + cooldown });
  }
}
