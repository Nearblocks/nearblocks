import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { RpcFailover } from 'nb-utils';

import { FailoverJsonRpcProvider } from './failoverProvider.js';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const servers: Server[] = [];
const TIMEOUT_MS = 300;

const start = async (handler: Handler): Promise<string> => {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
};

const closedPort = async (): Promise<string> => {
  const url = await start(() => undefined);
  const server = servers.pop()!;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return url;
};

const jsonRpc =
  (body: unknown, status = 200): Handler =>
  (_req, res) => {
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(body));
  };

const ok = (result: unknown) => jsonRpc({ id: 1, jsonrpc: '2.0', result });

const provider = (
  urls: Array<[string, string?]>,
  failover = new RpcFailover(),
) =>
  new FailoverJsonRpcProvider(
    urls.map(([url, authToken]) => ({ authToken: authToken ?? '', url })),
    { failover, retryDelayMs: 10, timeoutMs: TIMEOUT_MS },
  );

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    ),
  );
});

describe('FailoverJsonRpcProvider with real servers', () => {
  it('uses the primary and sends its bearer token', async () => {
    let authorization: string | undefined;
    const primary = await start((req, res) => {
      authorization = req.headers.authorization;
      ok({ from: 'primary' })(req, res);
    });
    const fallback = await start(ok({ from: 'fallback' }));

    const result = await provider([
      [primary, 'primary-token'],
      [fallback],
    ]).sendJsonRpc('status', []);

    expect(result).toEqual({ from: 'primary' });
    expect(authorization).toBe('Bearer primary-token');
  });

  it('falls over when the primary refuses connections', async () => {
    const fallback = await start(ok({ from: 'fallback' }));
    const started = Date.now();
    const result = await provider([
      [await closedPort()],
      [fallback],
    ]).sendJsonRpc('status', []);
    expect(result).toEqual({ from: 'fallback' });
    expect(Date.now() - started).toBeLessThan(TIMEOUT_MS + 1000);
  });

  it('falls over when the primary returns 503', async () => {
    const primary = await start(jsonRpc({ error: 'unavailable' }, 503));
    const fallback = await start(ok({ from: 'fallback' }));
    const started = Date.now();
    const result = await provider([[primary], [fallback]]).sendJsonRpc(
      'status',
      [],
    );
    expect(result).toEqual({ from: 'fallback' });
    expect(Date.now() - started).toBeLessThan(TIMEOUT_MS + 1000);
  });

  it('falls over when the primary returns a non-JSON 502', async () => {
    const primary = await start((_req, res) => {
      res.statusCode = 502;
      res.end('RPC upstream unavailable');
    });
    const fallback = await start(ok({ from: 'fallback' }));
    expect(
      await provider([[primary], [fallback]]).sendJsonRpc('status', []),
    ).toEqual({ from: 'fallback' });
  });

  it('falls over when the primary hangs, within the timeout', async () => {
    const primary = await start(() => undefined);
    const fallback = await start(ok({ from: 'fallback' }));
    const started = Date.now();
    const result = await provider([[primary], [fallback]]).sendJsonRpc(
      'status',
      [],
    );
    const elapsed = Date.now() - started;
    expect(result).toEqual({ from: 'fallback' });
    expect(elapsed).toBeGreaterThanOrEqual(TIMEOUT_MS - 50);
    expect(elapsed).toBeLessThan(TIMEOUT_MS + 1000);
  });

  it('falls over on UNKNOWN_BLOCK without opening the primary circuit', async () => {
    let primaryCalls = 0;
    const primary = await start((req, res) => {
      primaryCalls += 1;
      jsonRpc({
        error: {
          cause: { info: {}, name: 'UNKNOWN_BLOCK' },
          code: -32000,
          data: 'DB Not Found Error: BLOCK HEIGHT: 1',
          message: 'Server error',
          name: 'HANDLER_ERROR',
        },
        id: 1,
        jsonrpc: '2.0',
      })(req, res);
    });
    const fallback = await start(ok({ from: 'archival' }));
    const rpc = provider([[primary], [fallback]]);

    expect(await rpc.sendJsonRpc('block', { block_id: 1 })).toEqual({
      from: 'archival',
    });
    expect(await rpc.sendJsonRpc('block', { block_id: 2 })).toEqual({
      from: 'archival',
    });
    expect(primaryCalls).toBe(2);
  });

  it('retries a transient 503 when it is the only endpoint', async () => {
    let calls = 0;
    const only = await start((req, res) => {
      calls += 1;
      if (calls < 3) jsonRpc({ error: 'busy' }, 503)(req, res);
      else ok({ from: 'only' })(req, res);
    });
    expect(await provider([[only]]).sendJsonRpc('status', [])).toEqual({
      from: 'only',
    });
    expect(calls).toBe(3);
  });

  it('does not retry a rate-limited single endpoint', async () => {
    let calls = 0;
    const only = await start((req, res) => {
      calls += 1;
      jsonRpc({ error: 'slow down' }, 429)(req, res);
    });
    await expect(
      provider([[only]]).sendJsonRpc('status', []),
    ).rejects.toBeDefined();
    expect(calls).toBe(1);
  });

  it('opens the circuit for a dead primary so later calls skip it', async () => {
    let primaryCalls = 0;
    const primary = await start(() => {
      primaryCalls += 1;
    });
    const fallback = await start(ok({ from: 'fallback' }));
    const rpc = provider([[primary], [fallback]]);

    await rpc.sendJsonRpc('status', []);
    const started = Date.now();
    await rpc.sendJsonRpc('status', []);
    expect(primaryCalls).toBe(1);
    expect(Date.now() - started).toBeLessThan(TIMEOUT_MS / 2);
  });

  it('keeps application errors as near-api-js errors and does not fail over', async () => {
    let fallbackCalls = 0;
    const primary = await start(
      jsonRpc({
        error: {
          cause: { info: {}, name: 'UNKNOWN_ACCOUNT' },
          code: -32000,
          data: 'account does not exist',
          message: 'Server error',
          name: 'HANDLER_ERROR',
        },
        id: 1,
        jsonrpc: '2.0',
      }),
    );
    const fallback = await start((req, res) => {
      fallbackCalls += 1;
      ok({})(req, res);
    });

    await expect(
      provider([[primary], [fallback]]).sendJsonRpc('query', {}),
    ).rejects.toMatchObject({
      message: '[-32000] Server error: account does not exist',
      type: 'HANDLER_ERROR',
    });
    expect(fallbackCalls).toBe(0);
  });

  it('maps old-format and structured error data', async () => {
    const oldFormat = await start(
      jsonRpc({
        error: {
          code: -32000,
          data: { error_message: 'bad thing', error_type: 'LegacyError' },
          message: 'Server error',
        },
        id: 1,
        jsonrpc: '2.0',
      }),
    );
    await expect(
      provider([[oldFormat]]).sendJsonRpc('query', {}),
    ).rejects.toMatchObject({ message: 'bad thing', type: 'LegacyError' });

    const structured = await start(
      jsonRpc({
        error: {
          code: -32000,
          data: { TxExecutionError: { InvalidTxError: 'Expired' } },
          message: 'Server error',
        },
        id: 1,
        jsonrpc: '2.0',
      }),
    );
    await expect(
      provider([[structured]]).sendJsonRpc('query', {}),
    ).rejects.toMatchObject({ type: expect.any(String) });
  });

  it('maps node timeouts to TimeoutError and tries the next endpoint', async () => {
    let primaryCalls = 0;
    const timeoutAnswer = jsonRpc({
      error: {
        code: -32000,
        data: 'Timeout',
        message: 'Server error',
        name: 'TIMEOUT_ERROR',
      },
      id: 1,
      jsonrpc: '2.0',
    });
    const primary = await start((req, res) => {
      primaryCalls += 1;
      timeoutAnswer(req, res);
    });
    const fallback = await start(ok({ from: 'fallback' }));
    const client = provider([[primary], [fallback]]);
    expect(await client.sendJsonRpc('query', {})).toEqual({ from: 'fallback' });
    expect(await client.sendJsonRpc('query', {})).toEqual({ from: 'fallback' });
    // A slow query is the node's answer, not an outage: the primary circuit
    // stays closed and it is tried again on the next request.
    expect(primaryCalls).toBe(2);
  });

  it('reports an outage, not UNKNOWN_BLOCK, when another endpoint is down', async () => {
    const missing = await start(
      jsonRpc({
        error: {
          cause: { info: {}, name: 'UNKNOWN_BLOCK' },
          code: -32000,
          data: 'DB Not Found Error: BLOCK HEIGHT: 1',
          message: 'Server error',
          name: 'HANDLER_ERROR',
        },
        id: 1,
        jsonrpc: '2.0',
      }),
    );
    const down = await start(jsonRpc({ error: 'down' }, 503));
    for (const urls of [
      [missing, down],
      [down, missing],
    ]) {
      await expect(
        provider(urls.map((url) => [url])).sendJsonRpc('block', {}),
      ).rejects.toBeInstanceOf(AggregateError);
    }
  });

  it('reports an aggregate error when every endpoint is down', async () => {
    await expect(
      provider([[await closedPort()], [await closedPort()]]).sendJsonRpc(
        'status',
        [],
      ),
    ).rejects.toBeInstanceOf(AggregateError);
  });
});
