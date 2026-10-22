import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { RpcFailover } from 'nb-utils';

import { CountedAxiosRpc, CountedRpcClient } from './rpcClients.js';

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

const reply =
  (body: unknown, status = 200): Handler =>
  (_req, res) => {
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(body));
  };

const ok = (result: unknown) => reply({ id: 'near', jsonrpc: '2.0', result });

const unknownBlock = reply({
  error: {
    cause: { info: {}, name: 'UNKNOWN_BLOCK' },
    code: -32000,
    data: 'DB Not Found Error: BLOCK HEIGHT: 1',
    message: 'Server error',
    name: 'HANDLER_ERROR',
  },
  id: 'near',
  jsonrpc: '2.0',
});

const options = () => ({
  failover: new RpcFailover(),
  primaryRetryDelayMs: 10,
  timeoutMs: TIMEOUT_MS,
});

const endpoints = (...urls: string[]) =>
  urls.map((url) => ({ authToken: '', url }));

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

describe('CountedRpcClient with real servers', () => {
  const call = (client: CountedRpcClient) =>
    client.makeRequest<unknown, { from: string }>('status', []);

  it('falls over when the primary refuses connections', async () => {
    const fallback = await start(ok({ from: 'fallback' }));
    const client = new CountedRpcClient(
      endpoints(await closedPort(), fallback),
      options(),
    );
    expect(await call(client)).toEqual({ from: 'fallback' });
  });

  it('falls over when the primary returns 503', async () => {
    const primary = await start(reply({ error: 'down' }, 503));
    const fallback = await start(ok({ from: 'fallback' }));
    expect(
      await call(new CountedRpcClient(endpoints(primary, fallback), options())),
    ).toEqual({ from: 'fallback' });
  });

  it('falls over when the proxy answers 502 with a plain text body', async () => {
    const primary = await start((_req, res) => {
      res.statusCode = 502;
      res.setHeader('content-type', 'text/plain');
      res.end('RPC upstream unavailable');
    });
    const fallback = await start(ok({ from: 'fallback' }));
    expect(
      await call(new CountedRpcClient(endpoints(primary, fallback), options())),
    ).toEqual({ from: 'fallback' });
  });

  it('falls over when the primary hangs', async () => {
    const primary = await start(() => undefined);
    const fallback = await start(ok({ from: 'fallback' }));
    const started = Date.now();
    const result = await call(
      new CountedRpcClient(endpoints(primary, fallback), options()),
    );
    expect(result).toEqual({ from: 'fallback' });
    expect(Date.now() - started).toBeLessThan(TIMEOUT_MS * 3 + 1000);
  });

  it('does not retry a hung primary when a fallback exists', async () => {
    let primaryCalls = 0;
    const primary = await start(() => {
      primaryCalls += 1;
    });
    const fallback = await start(ok({ from: 'fallback' }));
    expect(
      await call(new CountedRpcClient(endpoints(primary, fallback), options())),
    ).toEqual({ from: 'fallback' });
    expect(primaryCalls).toBe(1);
  });

  it('retries the primary once before failing over', async () => {
    let primaryCalls = 0;
    const primary = await start((req, res) => {
      primaryCalls += 1;
      if (primaryCalls === 1) {
        req.socket.destroy();
        return;
      }
      ok({ from: 'primary' })(req, res);
    });
    const fallback = await start(ok({ from: 'fallback' }));
    expect(
      await call(new CountedRpcClient(endpoints(primary, fallback), options())),
    ).toEqual({ from: 'primary' });
    expect(primaryCalls).toBe(2);
  });

  it('falls over on UNKNOWN_BLOCK without retrying or opening the circuit', async () => {
    let primaryCalls = 0;
    const primary = await start((req, res) => {
      primaryCalls += 1;
      unknownBlock(req, res);
    });
    const fallback = await start(ok({ from: 'archival' }));
    const client = new CountedRpcClient(
      endpoints(primary, fallback),
      options(),
    );

    expect(await call(client)).toEqual({ from: 'archival' });
    expect(await call(client)).toEqual({ from: 'archival' });
    expect(primaryCalls).toBe(2);
  });

  it('surfaces an outage, not UNKNOWN_BLOCK, when another endpoint is down', async () => {
    const missing = await start(unknownBlock);
    const down = await start(reply({ error: 'down' }, 503));
    for (const urls of [
      [missing, down],
      [down, missing],
    ]) {
      await expect(
        call(new CountedRpcClient(endpoints(...urls), options())),
      ).rejects.toBeInstanceOf(AggregateError);
    }
  });

  it('does not fail over for application errors', async () => {
    let fallbackCalls = 0;
    const primary = await start(
      reply({
        error: {
          cause: { name: 'UNKNOWN_ACCOUNT' },
          code: -32000,
          data: { cause: { name: 'UNKNOWN_ACCOUNT' } },
          message: 'Server error',
        },
        id: 'near',
        jsonrpc: '2.0',
      }),
    );
    const fallback = await start((req, res) => {
      fallbackCalls += 1;
      ok({})(req, res);
    });
    await expect(
      call(new CountedRpcClient(endpoints(primary, fallback), options())),
    ).rejects.toMatchObject({ name: 'JsonRpcClientError' });
    expect(fallbackCalls).toBe(0);
  });
});

describe('CountedAxiosRpc with real servers', () => {
  const call = (client: CountedAxiosRpc) => client.query([], 'status');

  it('falls over when the primary refuses, returns 503, 502 text or hangs', async () => {
    const fallback = await start(ok({ from: 'fallback' }));
    const text502 = await start((_req, res) => {
      res.statusCode = 502;
      res.end('RPC upstream unavailable');
    });
    const unavailable = await start(reply({ error: 'down' }, 503));
    const hung = await start(() => undefined);

    for (const primary of [await closedPort(), text502, unavailable, hung]) {
      const client = new CountedAxiosRpc(
        endpoints(primary, fallback),
        options(),
      );
      const response = await call(client);
      expect(response.data).toEqual({
        id: 'near',
        jsonrpc: '2.0',
        result: { from: 'fallback' },
      });
    }
  });

  it('retries the primary once before failing over', async () => {
    let primaryCalls = 0;
    const primary = await start((req, res) => {
      primaryCalls += 1;
      if (primaryCalls === 1) {
        req.socket.destroy();
        return;
      }
      ok({ from: 'primary' })(req, res);
    });
    const fallback = await start(ok({ from: 'fallback' }));
    const response = await call(
      new CountedAxiosRpc(endpoints(primary, fallback), options()),
    );
    expect(response.data.result).toEqual({ from: 'primary' });
    expect(primaryCalls).toBe(2);
  });

  it('falls over on a 200 UNKNOWN_BLOCK body without opening the circuit', async () => {
    let primaryCalls = 0;
    const primary = await start((req, res) => {
      primaryCalls += 1;
      unknownBlock(req, res);
    });
    const fallback = await start(ok({ from: 'archival' }));
    const client = new CountedAxiosRpc(endpoints(primary, fallback), options());

    expect((await call(client)).data.result).toEqual({ from: 'archival' });
    expect((await call(client)).data.result).toEqual({ from: 'archival' });
    expect(primaryCalls).toBe(2);
  });

  it('returns the node error body when no endpoint has the block', async () => {
    const a = await start(unknownBlock);
    const b = await start(unknownBlock);
    const response = await call(
      new CountedAxiosRpc(endpoints(a, b), options()),
    );
    expect(response.data.error.cause.name).toBe('UNKNOWN_BLOCK');
  });

  it('surfaces an outage, not UNKNOWN_BLOCK, when another endpoint is down', async () => {
    const missing = await start(unknownBlock);
    const down = await start(reply({ error: 'down' }, 503));
    // Either order: missing history on one endpoint and an outage on the
    // other must not be reported as the block being absent.
    for (const urls of [
      [missing, down],
      [down, missing],
    ]) {
      await expect(
        call(new CountedAxiosRpc(endpoints(...urls), options())),
      ).rejects.toBeInstanceOf(AggregateError);
    }
  });

  it('falls over on a 200 node timeout or not-synced body', async () => {
    const fallback = await start(ok({ from: 'fallback' }));
    for (const data of [
      'Timeout',
      'There are no fully synchronized blocks on the node yet',
    ]) {
      const primary = await start(
        reply({
          error: { code: -32000, data, message: 'Server error' },
          id: 'near',
          jsonrpc: '2.0',
        }),
      );
      const response = await call(
        new CountedAxiosRpc(endpoints(primary, fallback), options()),
      );
      expect(response.data.result).toEqual({ from: 'fallback' });
    }
  });

  it('falls over when the primary rejects the key with 403', async () => {
    const primary = await start(reply('Forbidden', 403));
    const fallback = await start(ok({ from: 'fallback' }));
    const response = await call(
      new CountedAxiosRpc(endpoints(primary, fallback), options()),
    );
    expect(response.data.result).toEqual({ from: 'fallback' });
  });

  it('does not retry a rate-limited single endpoint', async () => {
    let calls = 0;
    const limited = await start((req, res) => {
      calls += 1;
      reply({ error: 'slow down' }, 429)(req, res);
    });
    await expect(
      call(new CountedAxiosRpc(endpoints(limited), options())),
    ).rejects.toBeDefined();
    expect(calls).toBe(1);
  });

  it('returns application error bodies without failing over', async () => {
    let fallbackCalls = 0;
    const primary = await start(
      reply({
        error: { cause: { name: 'UNKNOWN_ACCOUNT' }, code: -32000 },
        id: 'near',
        jsonrpc: '2.0',
      }),
    );
    const fallback = await start((req, res) => {
      fallbackCalls += 1;
      ok({})(req, res);
    });
    const response = await call(
      new CountedAxiosRpc(endpoints(primary, fallback), options()),
    );
    expect(response.data.error.cause.name).toBe('UNKNOWN_ACCOUNT');
    expect(fallbackCalls).toBe(0);
  });
});
