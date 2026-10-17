import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isMissingHistoryFailure,
  isNodeNotReady,
  isNodeQueryTimeout,
  isRetryableRpcFailure,
  RpcFailover,
  withRpcFallback,
} from '../dist/rpc-failover.js';

test('fails over for transport errors and keeps the primary response', async () => {
  let fallbackCalls = 0;
  const result = await withRpcFallback(async () => {
    throw Object.assign(new Error('connect failed'), { code: 'ECONNRESET' });
  }, [
    async () => {
      fallbackCalls += 1;
      return 'backup response';
    },
  ]);

  assert.equal(result, 'backup response');
  assert.equal(fallbackCalls, 1);
});

test('does not fail over for JSON-RPC application errors', async () => {
  let fallbackCalls = 0;
  const error = Object.assign(new Error('unknown account'), { code: -32000 });

  assert.equal(isRetryableRpcFailure(error), false);
  await assert.rejects(
    withRpcFallback(async () => {
      throw error;
    }, [
      async () => {
        fallbackCalls += 1;
        return 'should not run';
      },
    ]),
    error,
  );
  assert.equal(fallbackCalls, 0);
});

test('fails over on throttling or server errors, but not ordinary client errors', () => {
  assert.equal(isRetryableRpcFailure({ response: { status: 429 } }), true);
  assert.equal(isRetryableRpcFailure({ status: 503 }), true);
  assert.equal(isRetryableRpcFailure({ response: { status: 400 } }), false);
});

test('reports both endpoint failures if the fallback also fails', async () => {
  const primaryError = Object.assign(new Error('primary down'), {
    code: 'ECONNREFUSED',
  });
  const fallbackError = Object.assign(new Error('backup down'), {
    code: 'ETIMEDOUT',
  });

  await assert.rejects(
    withRpcFallback(async () => {
      throw primaryError;
    }, [
      async () => {
        throw fallbackError;
      },
    ]),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors, [primaryError, fallbackError]);
      return true;
    },
  );
});

test('tries configured fallbacks in order until one responds', async () => {
  const calls = [];
  const result = await withRpcFallback(async () => {
    calls.push('primary');
    throw Object.assign(new Error('primary down'), { code: 'ECONNRESET' });
  }, [
    async () => {
      calls.push('backup-1');
      throw Object.assign(new Error('backup down'), { code: 'ECONNRESET' });
    },
    async () => {
      calls.push('backup-2');
      return 'ok';
    },
  ]);

  assert.equal(result, 'ok');
  assert.deepEqual(calls, ['primary', 'backup-1', 'backup-2']);
});

test('opens a failed endpoint circuit and probes it after the cooldown', async () => {
  let now = 0;
  let primaryCalls = 0;
  const failover = new RpcFailover({ cooldownMs: 30_000, now: () => now });
  const endpoints = [
    {
      name: 'primary',
      request: async () => {
        primaryCalls += 1;
        if (now < 30_000) {
          throw Object.assign(new Error('primary down'), {
            code: 'ECONNREFUSED',
          });
        }
        return 'primary response';
      },
    },
    { name: 'backup', request: async () => 'backup response' },
  ];

  assert.equal(await failover.run(endpoints), 'backup response');
  assert.equal(await failover.run(endpoints), 'backup response');
  assert.equal(primaryCalls, 1);

  now = 30_000;
  assert.equal(await failover.run(endpoints), 'primary response');
  assert.equal(primaryCalls, 2);
});

test('treats HTTP error messages and timeouts as retryable', () => {
  for (const status of [408, 429, 500, 502, 503, 504]) {
    assert.equal(
      isRetryableRpcFailure(new Error(`HTTP error! status: ${status}`)),
      true,
    );
  }
  assert.equal(
    isRetryableRpcFailure(new Error('HTTP error! status: 400')),
    false,
  );
  assert.equal(
    isRetryableRpcFailure(
      Object.assign(new Error('timed out'), { name: 'TimeoutError' }),
    ),
    true,
  );
  assert.equal(
    isRetryableRpcFailure(
      new AggregateError([{ status: 503 }, { status: 502 }]),
    ),
    true,
  );
  assert.equal(
    isRetryableRpcFailure(
      new AggregateError([{ status: 503 }, new Error('unknown account')]),
    ),
    false,
  );
});

test('recognises missing-history errors across client shapes', () => {
  // near-api-js TypedError type / attached cause
  assert.equal(isMissingHistoryFailure({ type: 'UNKNOWN_BLOCK' }), true);
  assert.equal(
    isMissingHistoryFailure({
      cause: { name: 'GARBAGE_COLLECTED_BLOCK' },
      type: 'HANDLER_ERROR',
    }),
    true,
  );
  // jsonrpc-client JsonRpcClientError data
  assert.equal(
    isMissingHistoryFailure({
      data: { cause: { name: 'UNKNOWN_BLOCK' } },
      name: 'JsonRpcClientError',
    }),
    true,
  );
  assert.equal(
    isMissingHistoryFailure({ data: { name: 'UNKNOWN_BLOCK' } }),
    true,
  );
  assert.equal(
    isMissingHistoryFailure({
      data: 'DB Not Found Error: BLOCK HEIGHT: 5',
      name: 'JsonRpcClientError',
    }),
    true,
  );
  // axios body shape
  assert.equal(
    isMissingHistoryFailure({ error: { cause: { name: 'UNKNOWN_BLOCK' } } }),
    true,
  );
  assert.equal(isMissingHistoryFailure({ type: 'UNKNOWN_ACCOUNT' }), false);
  assert.equal(isMissingHistoryFailure(new Error('boom')), false);
  assert.equal(isMissingHistoryFailure(undefined), false);
  // Missing history is not a transport failure.
  assert.equal(isRetryableRpcFailure({ type: 'UNKNOWN_BLOCK' }), false);
});

test('falls over on missing history without opening the circuit', async () => {
  const failover = new RpcFailover();
  const missing = Object.assign(new Error('unknown block'), {
    type: 'UNKNOWN_BLOCK',
  });
  let primaryCalls = 0;
  const endpoints = [
    {
      name: 'a',
      request: async () => {
        primaryCalls += 1;
        throw missing;
      },
    },
    { name: 'b', request: async () => 'archival' },
  ];

  assert.equal(await failover.run(endpoints), 'archival');
  assert.equal(await failover.run(endpoints), 'archival');
  // Primary still tried on every request: its circuit never opened.
  assert.equal(primaryCalls, 2);
});

test('surfaces the missing-history error when no endpoint has the block', async () => {
  const failover = new RpcFailover();
  const missing = Object.assign(new Error('unknown block'), {
    type: 'UNKNOWN_BLOCK',
  });
  await assert.rejects(
    failover.run([
      { name: 'a', request: async () => Promise.reject(missing) },
      { name: 'b', request: async () => Promise.reject(missing) },
    ]),
    missing,
  );
});

test('still opens the circuit for transport failures', async () => {
  const failover = new RpcFailover();
  let primaryCalls = 0;
  const endpoints = [
    {
      name: 'a',
      request: async () => {
        primaryCalls += 1;
        throw Object.assign(new Error('refused'), { code: 'ECONNREFUSED' });
      },
    },
    { name: 'b', request: async () => 'backup' },
  ];
  await failover.run(endpoints);
  await failover.run(endpoints);
  assert.equal(primaryCalls, 1);
});

test('treats a JsonRpcClientError without a JSON-RPC code as a transport failure', () => {
  assert.equal(
    isRetryableRpcFailure({ message: '', name: 'JsonRpcClientError' }),
    true,
  );
  assert.equal(
    isRetryableRpcFailure({
      code: -32000,
      message: 'Server error',
      name: 'JsonRpcClientError',
    }),
    false,
  );
});

test('falls over on a node query timeout without opening the circuit', async () => {
  const failover = new RpcFailover();
  // near-api-js maps a node "query has timed out" answer to type TimeoutError.
  const slowQuery = Object.assign(new Error('query has timed out'), {
    type: 'TimeoutError',
  });
  assert.equal(isNodeQueryTimeout(slowQuery), true);
  assert.equal(isRetryableRpcFailure(slowQuery), false);
  let primaryCalls = 0;
  const endpoints = [
    {
      name: 'a',
      request: async () => {
        primaryCalls += 1;
        throw slowQuery;
      },
    },
    { name: 'b', request: async () => 'fallback' },
  ];

  assert.equal(await failover.run(endpoints), 'fallback');
  assert.equal(await failover.run(endpoints), 'fallback');
  // One slow query must not move all traffic off the primary.
  assert.equal(primaryCalls, 2);

  await assert.rejects(
    failover.run([
      { name: 'c', request: async () => Promise.reject(slowQuery) },
      { name: 'd', request: async () => Promise.reject(slowQuery) },
    ]),
    slowQuery,
  );
});

test('reports an outage, not missing history, when any endpoint is down', async () => {
  const missing = Object.assign(new Error('unknown block'), {
    type: 'UNKNOWN_BLOCK',
  });
  const down = { status: 503 };
  for (const [first, second] of [
    [missing, down],
    [down, missing],
  ]) {
    const error = await new RpcFailover()
      .run([
        { name: 'a', request: async () => Promise.reject(first) },
        { name: 'b', request: async () => Promise.reject(second) },
      ])
      .catch((caught) => caught);
    assert.ok(error instanceof AggregateError);
    assert.equal(isMissingHistoryFailure(error), false);
  }
  assert.equal(
    isMissingHistoryFailure(new AggregateError([missing, missing])),
    true,
  );
});

test('tries an open-circuit fallback before reporting missing history', async () => {
  let now = 0;
  const failover = new RpcFailover({ now: () => now });
  const missing = Object.assign(new Error('unknown block'), {
    type: 'UNKNOWN_BLOCK',
  });
  let archivalUp = false;
  const endpoints = [
    { name: 'node', request: async () => Promise.reject(missing) },
    {
      name: 'archival',
      request: async () => {
        if (!archivalUp) throw { status: 503 };
        return 'archival';
      },
    },
  ];
  // The archival endpoint blips once: its circuit opens.
  await assert.rejects(failover.run(endpoints), AggregateError);
  archivalUp = true;
  now = 1_000;
  // Still inside the cooldown, the old block must not be reported missing.
  assert.equal(await failover.run(endpoints), 'archival');
});

test('counts concurrent failures in one blip as a single incident', async () => {
  let now = 0;
  const failover = new RpcFailover({ now: () => now });
  let primaryUp = false;
  let primaryCalls = 0;
  const endpoints = [
    {
      name: 'p',
      request: async () => {
        primaryCalls += 1;
        if (!primaryUp) throw { status: 503 };
        return 'primary';
      },
    },
    { name: 'f', request: async () => 'fallback' },
  ];
  await Promise.all(Array.from({ length: 20 }, () => failover.run(endpoints)));
  primaryUp = true;
  primaryCalls = 0;
  // One incident: the 30s cooldown applies, not the 5-minute maximum.
  now = 31_000;
  assert.equal(await failover.run(endpoints), 'primary');
  assert.equal(primaryCalls, 1);
});

test('falls over on not-synced, shard and auth failures', () => {
  for (const error of [
    Object.assign(new Error('x'), { type: 'NOT_SYNCED_YET' }),
    Object.assign(new Error('x'), { type: 'UNAVAILABLE_SHARD' }),
    {
      code: -32000,
      data: 'There are no fully synchronized blocks on the node yet',
      message: 'Server error',
      name: 'JsonRpcClientError',
    },
  ]) {
    assert.equal(isNodeNotReady(error), true);
    assert.equal(isRetryableRpcFailure(error), false);
  }
  for (const status of [401, 403]) {
    assert.equal(isRetryableRpcFailure({ status }), true);
    assert.equal(
      isRetryableRpcFailure(new Error(`HTTP error! status: ${status}`)),
      true,
    );
  }
  // Backend client shape of a node query timeout.
  assert.equal(
    isNodeQueryTimeout({
      code: -32000,
      data: 'Timeout',
      message: 'Server error',
      name: 'JsonRpcClientError',
    }),
    true,
  );
  // A transport timeout is an outage, not a node answer.
  const transport = Object.assign(new Error('RPC request timed out'), {
    cause: Object.assign(new Error('aborted'), { name: 'TimeoutError' }),
    name: 'TimeoutError',
  });
  assert.equal(isNodeQueryTimeout(transport), false);
  assert.equal(isRetryableRpcFailure(transport), true);
});

test('caps the circuit cooldown at a minute so a recovered primary returns', async () => {
  let now = 0;
  const failover = new RpcFailover({ now: () => now });
  let primaryUp = false;
  const endpoints = [
    {
      name: 'p',
      request: async () => {
        if (!primaryUp) throw { status: 503 };
        return 'primary';
      },
    },
    { name: 'f', request: async () => 'fallback' },
  ];
  // Fail on every probe for a long outage: cooldowns 30s, 60s, then 60s.
  for (let i = 0; i < 10; i++) {
    await failover.run(endpoints);
    now += 61_000;
  }
  primaryUp = true;
  assert.equal(await failover.run(endpoints), 'primary');
});
