import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it, vi } from 'vitest';

import * as metrics from '#metrics';
import type { AppState } from '#state';
import { StatsCollector } from '#stats';
import { UpstreamRedirectError } from '#types';

import { createDataServer } from './server.js';

// The upstream proxy hands older blocks back as redirects.
const PROXY_ONLY = { localHeight: null, sources: ['proxy'] };
const HEIGHT = 212615360;
const notFound = Object.assign(new Error('block not found'), {
  notFound: true,
});

function blockAt(height: number): Buffer {
  return Buffer.from(
    JSON.stringify({
      block: {
        header: {
          hash: `block-hash-${height}`,
          height,
          timestamp_nanosec: '1000000000000',
        },
      },
      shards: [],
    }),
  );
}
const blockBytes = blockAt(HEIGHT);
const nextBlockBytes = blockAt(HEIGHT + 1);
const anotherBlockBytes = blockAt(HEIGHT + 2);
const thirdBlockBytes = blockAt(HEIGHT + 3);

async function withServer(
  callback: (baseUrl: string, state: AppState) => Promise<void>,
  options: {
    apiKey?: string;
    block?: Buffer;
    finalHeight?: number;
    inSync?: boolean;
    localHeight?: null | number;
    nodeRpcUrl?: string;
    publishedHeight?: number;
    sources?: string[];
  } = {},
): Promise<void> {
  const fetchLastBlockHeight = vi
    .fn()
    .mockResolvedValue(options.finalHeight ?? HEIGHT + 2);
  const finalBlock = Buffer.from(
    JSON.stringify({
      block: { header: { height: options.localHeight ?? HEIGHT } },
    }),
  );
  const localFinalBlock = vi.fn().mockReturnValue(finalBlock);
  const state = {
    blockProxy: {
      fetch: vi.fn().mockRejectedValue(new Error('proxy unavailable')),
      fetchLastBlockHeight: vi
        .fn()
        .mockRejectedValue(new Error('proxy unavailable')),
    } as never,
    cache: {} as never,
    config: {
      blockSources: options.sources ?? ['node', 'neardata'],
      cacheEnabled: false,
      dedupTtlMs: 50,
      indexerIntervalMs: 10,
      nodeRpcUrl: options.nodeRpcUrl ?? 'http://127.0.0.1:3030',
      proxyApiKey: options.apiKey ?? '',
      rpcAllowedMethods: ['block', 'query', 'status'],
      upstreamTimeoutMs: 1000,
    } as never,
    dedup: new Map(),
    localIndexer:
      options.localHeight === null
        ? null
        : ({
            currentFinalizedHeight: vi
              .fn()
              .mockReturnValue(
                options.inSync === false
                  ? null
                  : (options.localHeight ?? HEIGHT),
              ),
            finalBlock: localFinalBlock,
            isInSync: vi.fn().mockReturnValue(options.inSync ?? true),
            isNodeCurrent: vi.fn().mockReturnValue(options.inSync ?? true),
            status: {
              published:
                options.publishedHeight ?? options.localHeight ?? HEIGHT,
            },
            waitForBlock: vi.fn().mockResolvedValue(null),
          } as never),
    neardata: {
      fetch: vi.fn().mockImplementation(async () => {
        if (!options.block) throw notFound;
        return options.block;
      }),
      fetchLastBlockHeight,
    } as never,
    ready: true,
    shadow: null,
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: 'test',
  } as AppState;

  const server = createDataServer(state).listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await callback(`http://127.0.0.1:${port}`, state);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

describe('block API behavior', () => {
  afterEach(() => vi.restoreAllMocks());

  it('serves from the next source without waiting while the node catches up', async () => {
    const behind = HEIGHT - 10;
    const block = Buffer.from(
      JSON.stringify({
        block: { header: { hash: 'h', height: behind } },
        shards: [],
      }),
    );
    await withServer(
      async (baseUrl) => {
        const started = Date.now();
        const response = await fetch(`${baseUrl}/v0/block/${behind}`);
        expect(response.status).toBe(200);
        expect(response.headers.get('x-upstream-source')).toBe('neardata');
        // upstreamTimeoutMs is 1000 here; waiting on the node would take that.
        expect(Date.now() - started).toBeLessThan(500);
      },
      { block, localHeight: HEIGHT, publishedHeight: HEIGHT - 50 },
    );
  });

  it('retries a missing height below the head instead of inventing null', async () => {
    await withServer(
      async (baseUrl, state) => {
        const indexer = state.localIndexer as unknown as {
          currentFinalizedHeight: ReturnType<typeof vi.fn>;
          waitForBlock: ReturnType<typeof vi.fn>;
        };
        indexer.currentFinalizedHeight.mockImplementationOnce(() => {
          indexer.waitForBlock.mockResolvedValue({
            bytes: blockBytes,
            source: 'node',
          });
          return HEIGHT;
        });
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(response.status).toBe(200);
        expect(await response.text()).toBe(blockBytes.toString('utf8'));
        expect(indexer.waitForBlock).toHaveBeenCalledTimes(2);
      },
      { publishedHeight: HEIGHT - 1 },
    );
  });

  it('returns 502 after repeated misses below the finalized head', async () => {
    await withServer(
      async (baseUrl, state) => {
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(response.status).toBe(502);
        expect(await response.text()).toBe('"all upstream sources failed"');
        expect(state.neardata.fetch).toHaveBeenCalledTimes(3);
      },
      { localHeight: null },
    );
  });

  it('waits for the next finalized node block before using remote sources', async () => {
    await withServer(
      async (baseUrl, state) => {
        const indexer = state.localIndexer as unknown as {
          currentFinalizedHeight: ReturnType<typeof vi.fn>;
          status: { published: number };
          waitForBlock: ReturnType<typeof vi.fn>;
        };
        state.config = { ...state.config, cacheEnabled: true } as never;
        const cached = new Map([[HEIGHT, blockBytes]]);
        state.cache = {
          read: vi
            .fn()
            .mockImplementation(async (height: number) => cached.get(height)),
        } as never;
        const attempts = new Map<number, number>();
        indexer.waitForBlock.mockImplementation(async (height: number) => {
          const attempt = (attempts.get(height) ?? 0) + 1;
          attempts.set(height, attempt);
          if (attempt === 1) return null;
          const bytes =
            height === HEIGHT + 1
              ? nextBlockBytes
              : height === HEIGHT + 2
                ? anotherBlockBytes
                : thirdBlockBytes;
          cached.set(height, bytes);
          indexer.status.published = height;
          indexer.currentFinalizedHeight.mockReturnValue(height);
          return { bytes, source: 'node' };
        });

        const latest = await fetch(`${baseUrl}/v0/last_block/final`);
        expect(latest.status).toBe(200);
        expect(await latest.text()).toBe(blockBytes.toString('utf8'));

        for (const [offset, expected] of [
          [1, nextBlockBytes],
          [2, anotherBlockBytes],
          [3, thirdBlockBytes],
        ] as const) {
          const response = await fetch(
            `${baseUrl}/v0/block/${HEIGHT + offset}`,
          );
          expect(response.status).toBe(200);
          expect(response.headers.get('x-upstream-source')).toBe('node');
          expect(await response.text()).toBe(expected.toString('utf8'));
        }
        expect(indexer.waitForBlock).toHaveBeenCalledTimes(6);
        expect(state.neardata.fetch).not.toHaveBeenCalled();
      },
      { publishedHeight: HEIGHT },
    );
  });

  it('uses remote fallback when the local node head is unhealthy', async () => {
    await withServer(
      async (baseUrl, state) => {
        const indexer = state.localIndexer as unknown as {
          currentFinalizedHeight: ReturnType<typeof vi.fn>;
        };
        indexer.currentFinalizedHeight.mockReturnValue(null);
        vi.mocked(state.neardata.fetch).mockRejectedValue(
          Object.assign(new Error('upstream rate limited'), {
            body: '{"error":"limited"}',
            retryAfter: '4',
            status: 429,
          }),
        );

        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 1}`);
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('4');
        expect(await response.text()).toBe('{"error":"limited"}');
        expect(state.neardata.fetch).toHaveBeenCalledOnce();
      },
      { publishedHeight: HEIGHT },
    );
  });

  it('returns the normal future-block response outside the local tip window', async () => {
    await withServer(async (baseUrl, state) => {
      const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 20}`);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: 'The block is too far in the future',
        type: 'BLOCK_DOES_NOT_EXIST',
      });
      expect(state.neardata.fetch).toHaveBeenCalledOnce();
    });
  });

  it('falls back after the local tip wait reaches the upstream timeout', async () => {
    await withServer(async (baseUrl, state) => {
      state.config = {
        ...state.config,
        upstreamTimeoutMs: 30,
      } as never;
      vi.mocked(state.neardata.fetch).mockResolvedValue(blockAt(HEIGHT + 1));

      const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 1}`);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-upstream-source')).toBe('neardata');
      expect(await response.text()).toBe(blockAt(HEIGHT + 1).toString('utf8'));
      expect(state.neardata.fetch).toHaveBeenCalledOnce();
    });
  });

  it('caps the local tip wait well below a downstream proxy timeout', async () => {
    await withServer(async (baseUrl, state) => {
      // A downstream (k8s) proxy times out at the same 10s; this proxy must
      // answer first so it does not just time out.
      state.config = { ...state.config, upstreamTimeoutMs: 10_000 } as never;
      vi.mocked(state.neardata.fetch).mockResolvedValue(blockAt(HEIGHT + 1));
      const started = Date.now();
      const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 1}`);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-upstream-source')).toBe('neardata');
      expect(Date.now() - started).toBeLessThan(4_500);
    });
  }, 15_000);

  it('preserves an upstream rate limit response', async () => {
    await withServer(
      async (baseUrl, state) => {
        vi.mocked(state.neardata.fetch).mockRejectedValue(
          Object.assign(new Error('neardata rate limited'), {
            body: '{"error":"rate limited"}',
            contentType: 'application/json',
            retryAfter: '3',
            status: 429,
          }),
        );
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 1}`);
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('3');
        expect(await response.text()).toBe('{"error":"rate limited"}');
      },
      { localHeight: null },
    );
  });

  it('tries the next configured source after a primary rate limit', async () => {
    await withServer(
      async (baseUrl, state) => {
        vi.mocked(state.blockProxy.fetch).mockRejectedValue(
          Object.assign(new Error('proxy rate limited'), {
            body: '{"error":"rate limited"}',
            contentType: 'application/json',
            retryAfter: '2',
            status: 429,
          }),
        );
        vi.mocked(state.neardata.fetch).mockResolvedValue(blockBytes);
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(response.status).toBe(200);
        expect(await response.text()).toBe(blockBytes.toString('utf8'));
        expect(response.headers.get('x-upstream-source')).toBe('neardata');
        expect(state.blockProxy.fetch).toHaveBeenCalledOnce();
        expect(state.neardata.fetch).toHaveBeenCalledOnce();
      },
      { localHeight: null, sources: ['proxy', 'neardata'] },
    );
  });

  it('rejects mismatched upstream block heights before returning data', async () => {
    await withServer(
      async (baseUrl, state) => {
        vi.mocked(state.blockProxy.fetch).mockResolvedValue(
          Buffer.from(
            JSON.stringify({
              block: { header: { hash: 'wrong', height: HEIGHT - 1 } },
              shards: [],
            }),
          ),
        );
        vi.mocked(state.neardata.fetch).mockResolvedValue(blockBytes);
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(response.status).toBe(200);
        expect(await response.text()).toBe(blockBytes.toString('utf8'));
        expect(response.headers.get('x-upstream-source')).toBe('neardata');
      },
      { localHeight: null, sources: ['proxy', 'neardata'] },
    );
  });

  it('preserves the final upstream rate-limit status, body and retry-after', async () => {
    await withServer(
      async (baseUrl, state) => {
        vi.mocked(state.neardata.fetch).mockRejectedValue(
          Object.assign(new Error('neardata rate limited'), {
            body: '{"error":"rate limited"}',
            contentType: 'application/json',
            retryAfter: '7',
            status: 429,
          }),
        );
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('7');
        expect(response.headers.get('content-type')).toContain(
          'application/json',
        );
        expect(await response.text()).toBe('{"error":"rate limited"}');
      },
      { localHeight: null, sources: ['neardata'] },
    );
  });

  it('returns a recorded skipped height as 200 null with only the node source', async () => {
    await withServer(
      async (baseUrl, state) => {
        (
          state.localIndexer as unknown as {
            isSkippedHeight: ReturnType<typeof vi.fn>;
          }
        ).isSkippedHeight = vi.fn().mockReturnValue(true);
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('null');
        expect(state.neardata.fetch).not.toHaveBeenCalled();
      },
      { sources: ['node'] },
    );
  });

  it('answers a near-tip miss on a node-only proxy as not yet, not a 5xx', async () => {
    await withServer(
      async (baseUrl, state) => {
        state.config = { ...state.config, upstreamTimeoutMs: 30 } as never;
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 1}`);
        // A downstream proxy cools a source down on 5xx; a miss must not.
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(await response.json()).toMatchObject({
          type: 'BLOCK_DOES_NOT_EXIST',
        });
      },
      { sources: ['node'] },
    );
  });

  it('does not mistake an uncached older node block for a skipped height', async () => {
    await withServer(
      async (baseUrl, state) => {
        (
          state.localIndexer as unknown as {
            isSkippedHeight: ReturnType<typeof vi.fn>;
          }
        ).isSkippedHeight = vi.fn().mockReturnValue(false);
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT - 1}`);
        // A miss, not an outage: a downstream proxy must not cool down on it.
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(await response.json()).toMatchObject({ type: 'BLOCK_NOT_HELD' });
      },
      { sources: ['node'] },
    );
  });

  it('uses the next configured source for head lookup', async () => {
    await withServer(
      async (baseUrl, state) => {
        const response = await fetch(`${baseUrl}/v0/last_block/final`, {
          redirect: 'manual',
        });
        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe(
          `/v0/block/${HEIGHT + 2}`,
        );
        expect(state.neardata.fetchLastBlockHeight).toHaveBeenCalledOnce();
      },
      { localHeight: null },
    );
  });

  it('uses the highest seen finalized height when sources switch', async () => {
    await withServer(
      async (baseUrl, state) => {
        const first = await fetch(`${baseUrl}/v0/last_block/final`, {
          redirect: 'manual',
        });
        expect(first.headers.get('location')).toBe(`/v0/block/${HEIGHT}`);
        await new Promise((resolve) => setTimeout(resolve, 1010));
        (
          state.localIndexer as unknown as {
            currentFinalizedHeight: ReturnType<typeof vi.fn>;
          }
        ).currentFinalizedHeight.mockReturnValue(null);
        const stateResponse = await fetch(`${baseUrl}/v0/last_block/final`, {
          redirect: 'manual',
        });
        expect(stateResponse.headers.get('location')).toBe(
          `/v0/block/${HEIGHT}`,
        );
      },
      { finalHeight: HEIGHT - 2 },
    );
  });

  it('returns an error when every finalized-head source fails', async () => {
    await withServer(
      async (baseUrl, state) => {
        const first = await fetch(`${baseUrl}/v0/last_block/final`, {
          redirect: 'manual',
        });
        expect(first.status).toBe(302);
        await new Promise((resolve) => setTimeout(resolve, 1010));
        (
          state.localIndexer as unknown as {
            currentFinalizedHeight: ReturnType<typeof vi.fn>;
          }
        ).currentFinalizedHeight.mockReturnValue(null);
        vi.mocked(state.neardata.fetchLastBlockHeight).mockRejectedValue(
          new Error('upstream unavailable'),
        );
        const failed = await fetch(`${baseUrl}/v0/last_block/final`, {
          redirect: 'manual',
        });
        expect(failed.status).toBe(503);
        expect(await failed.text()).toBe('"Internal data error"');
      },
      { finalHeight: HEIGHT },
    );
  });

  it('returns null for skipped finalized heights and a 404 for future heights', async () => {
    await withServer(
      async (baseUrl, state) => {
        vi.mocked(state.neardata.fetch).mockImplementation(async (height) => {
          if (height === HEIGHT) return Buffer.from('null');
          throw notFound;
        });
        const nullBlock = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(await nullBlock.text()).toBe('null');
        const future = await fetch(`${baseUrl}/v0/block/${HEIGHT + 20}`);
        expect(future.status).toBe(404);
        expect(await future.json()).toEqual({
          error: 'The block is too far in the future',
          type: 'BLOCK_DOES_NOT_EXIST',
        });
      },
      { localHeight: null },
    );
  });

  it('returns argument and height-bound errors', async () => {
    await withServer(async (baseUrl) => {
      const invalid = await fetch(`${baseUrl}/v0/block/not-a-height`);
      expect(invalid.status).toBe(400);
      expect(await invalid.json()).toBe('Invalid argument');
      const aboveLimit = await fetch(`${baseUrl}/v0/block/1000000000000001`);
      expect(aboveLimit.status).toBe(404);
      expect(await aboveLimit.json()).toMatchObject({
        type: 'BLOCK_HEIGHT_TOO_HIGH',
      });
    });
  });

  it('serves block bytes unchanged and returns redirects for the final head', async () => {
    await withServer(
      async (baseUrl) => {
        const full = await fetch(`${baseUrl}/v0/block/${HEIGHT}`);
        expect(full.status).toBe(200);
        expect(await full.text()).toBe(blockBytes.toString('utf8'));
        expect(full.headers.get('x-upstream-source')).toBe('neardata');
        const last = await fetch(
          `${baseUrl}/v0/last_block/final?api_key=sample`,
          {
            redirect: 'manual',
          },
        );
        expect(last.headers.get('location')).toBe(
          `/v0/block/${HEIGHT}?api_key=sample`,
        );
      },
      { block: blockBytes },
    );
  });

  it('enforces the proxy key from query, Bearer, and X-API-Key', async () => {
    await withServer(
      async (baseUrl) => {
        expect((await fetch(`${baseUrl}/v0/block/${HEIGHT}`)).status).toBe(403);
        expect(
          (
            await fetch(`${baseUrl}/v0/block/${HEIGHT}`, {
              headers: { authorization: 'Bearer local-secret' },
            })
          ).status,
        ).toBe(200);
        expect(
          (await fetch(`${baseUrl}/v0/block/${HEIGHT}?api_key=local-secret`))
            .status,
        ).toBe(200);
        expect(
          (
            await fetch(`${baseUrl}/v0/block/${HEIGHT}`, {
              headers: { 'x-api-key': 'local-secret' },
            })
          ).status,
        ).toBe(200);
      },
      { apiKey: 'local-secret', block: blockBytes },
    );
  });

  it('proxies JSON-RPC through the local node with the same client key', async () => {
    const rpcUpstream = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        res.statusCode = 201;
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            authorization: req.headers.authorization ?? null,
            body: Buffer.concat(chunks).toString('utf8'),
            path: req.url,
            proxyKey: req.headers['x-api-key'] ?? null,
          }),
        );
      });
    });
    rpcUpstream.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) =>
      rpcUpstream.once('listening', resolve),
    );
    const { port } = rpcUpstream.address() as AddressInfo;
    try {
      await withServer(
        async (baseUrl) => {
          const requestBody = JSON.stringify({
            id: 7,
            jsonrpc: '2.0',
            method: 'status',
            params: [],
          });
          expect(
            (await fetch(`${baseUrl}/rpc`, { method: 'POST' })).status,
          ).toBe(403);

          for (const [path, auth] of [
            ['/rpc?api_key=local-secret', {}],
            ['/rpc', { authorization: 'Bearer local-secret' }],
            ['/rpc', { 'x-api-key': 'local-secret' }],
          ] as const) {
            const response = await fetch(`${baseUrl}${path}`, {
              body: requestBody,
              headers: { 'content-type': 'application/json', ...auth },
              method: 'POST',
            });
            expect(response.status).toBe(201);
            expect(response.headers.get('cache-control')).toBe('no-store');
            expect(await response.json()).toEqual({
              authorization: null,
              body: requestBody,
              path: '/',
              proxyKey: null,
            });
          }
        },
        { apiKey: 'local-secret', nodeRpcUrl: `http://127.0.0.1:${port}` },
      );
    } finally {
      rpcUpstream.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        rpcUpstream.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it('enforces the JSON-RPC method allowlist', async () => {
    const received: string[] = [];
    const rpcUpstream = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        received.push(Buffer.concat(chunks).toString('utf8'));
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result: 'ok' }));
      });
    });
    rpcUpstream.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) =>
      rpcUpstream.once('listening', resolve),
    );
    const { port } = rpcUpstream.address() as AddressInfo;
    const post = (baseUrl: string, body: string) =>
      fetch(`${baseUrl}/rpc`, {
        body,
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
    try {
      await withServer(
        async (baseUrl) => {
          const allowed = await post(
            baseUrl,
            JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'query' }),
          );
          expect(allowed.status).toBe(200);
          expect(await allowed.json()).toMatchObject({ result: 'ok' });
          expect(received).toHaveLength(1);

          const denied = await post(
            baseUrl,
            JSON.stringify({
              id: 'abc',
              jsonrpc: '2.0',
              method: 'broadcast_tx_commit',
              params: [],
            }),
          );
          expect(denied.status).toBe(200);
          expect(denied.headers.get('cache-control')).toBe('no-store');
          expect(await denied.json()).toEqual({
            error: {
              code: -32601,
              message: 'Method not found or not allowed',
            },
            id: 'abc',
            jsonrpc: '2.0',
          });

          const batch = await post(
            baseUrl,
            JSON.stringify([
              { id: 1, jsonrpc: '2.0', method: 'status' },
              { id: 2, jsonrpc: '2.0', method: 'send_tx' },
            ]),
          );
          expect(batch.status).toBe(200);
          const batchBody = (await batch.json()) as Array<{
            error: { code: number };
            id: number;
          }>;
          expect(batchBody.map((item) => item.id)).toEqual([1, 2]);
          expect(batchBody.every((item) => item.error.code === -32601)).toBe(
            true,
          );

          const allowedBatch = await post(
            baseUrl,
            JSON.stringify([
              { id: 1, jsonrpc: '2.0', method: 'status' },
              { id: 2, jsonrpc: '2.0', method: 'block' },
            ]),
          );
          expect(allowedBatch.status).toBe(200);

          const invalid = await post(baseUrl, '{not json');
          expect(invalid.status).toBe(400);
          const notObject = await post(baseUrl, '42');
          expect(notObject.status).toBe(400);
          const emptyBatch = await post(baseUrl, '[]');
          expect(emptyBatch.status).toBe(400);

          // Only the two allowed requests reached the node.
          expect(received).toHaveLength(2);
        },
        { nodeRpcUrl: `http://127.0.0.1:${port}` },
      );
    } finally {
      rpcUpstream.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        rpcUpstream.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it('answers upstream outages with a plain-text 502 rather than a JSON-RPC body', async () => {
    const dead = createServer();
    dead.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => dead.once('listening', resolve));
    const { port } = dead.address() as AddressInfo;
    await new Promise<void>((resolve) => dead.close(() => resolve()));

    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/rpc`, {
          body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'status' }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        });
        expect(response.status).toBe(502);
        expect(response.headers.get('content-type')).toMatch(/^text\/plain/);
        expect(response.headers.get('cache-control')).toBe('no-store');
        const text = await response.text();
        expect(text).toBe('RPC upstream unavailable');
        expect(() => JSON.parse(text)).toThrow();
      },
      { nodeRpcUrl: `http://127.0.0.1:${port}` },
    );
  });

  it('answers a hung upstream with a plain-text 504', async () => {
    const hung = createServer(() => undefined);
    hung.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => hung.once('listening', resolve));
    const { port } = hung.address() as AddressInfo;
    try {
      await withServer(
        async (baseUrl, state) => {
          (state.config as { upstreamTimeoutMs: number }).upstreamTimeoutMs =
            100;
          const response = await fetch(`${baseUrl}/rpc`, {
            body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'status' }),
            headers: { 'content-type': 'application/json' },
            method: 'POST',
          });
          expect(response.status).toBe(504);
          expect(response.headers.get('content-type')).toMatch(/^text\/plain/);
        },
        { nodeRpcUrl: `http://127.0.0.1:${port}` },
      );
    } finally {
      hung.closeAllConnections();
      await new Promise<void>((resolve) => hung.close(() => resolve()));
    }
  });

  describe('when the node is out of sync', () => {
    async function withRpcNode(
      callback: (url: string, hits: () => number) => Promise<void>,
    ): Promise<void> {
      let hits = 0;
      const node = createServer((_req, res) => {
        hits++;
        res.setHeader('content-type', 'application/json');
        res.end('{"jsonrpc":"2.0","id":1,"result":{}}');
      });
      node.listen(0, '127.0.0.1');
      await new Promise<void>((resolve) => node.once('listening', resolve));
      const { port } = node.address() as AddressInfo;
      try {
        await callback(`http://127.0.0.1:${port}`, () => hits);
      } finally {
        node.closeAllConnections();
        await new Promise<void>((resolve, reject) =>
          node.close((error) => (error ? reject(error) : resolve())),
        );
      }
    }
    const rpcBody = JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'status',
      params: [],
    });
    const post = (baseUrl: string, body: string) =>
      fetch(`${baseUrl}/rpc`, {
        body,
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });

    it('answers /rpc with a plain-text 503 without contacting the node', async () => {
      await withRpcNode(async (nodeRpcUrl, hits) => {
        await withServer(
          async (baseUrl) => {
            const response = await post(baseUrl, rpcBody);
            expect(response.status).toBe(503);
            expect(response.headers.get('content-type')).toContain(
              'text/plain',
            );
            expect(response.headers.get('cache-control')).toBe('no-store');
            expect(await response.text()).toBe('RPC node out of sync');
            expect(hits()).toBe(0);
          },
          { inSync: false, nodeRpcUrl },
        );
      });
    });

    it('still enforces the allowlist and body validation on /rpc', async () => {
      await withRpcNode(async (nodeRpcUrl, hits) => {
        await withServer(
          async (baseUrl) => {
            const denied = await post(
              baseUrl,
              JSON.stringify({ id: 9, jsonrpc: '2.0', method: 'broadcast_tx' }),
            );
            expect(denied.status).toBe(200);
            expect(await denied.json()).toMatchObject({
              error: { code: -32601 },
              id: 9,
            });
            expect((await post(baseUrl, 'not json')).status).toBe(400);
            expect(hits()).toBe(0);
          },
          { inSync: false, nodeRpcUrl },
        );
      });
    });

    it('requires the client key before reporting the node state', async () => {
      await withServer(
        async (baseUrl) => {
          expect((await post(baseUrl, rpcBody)).status).toBe(403);
        },
        { apiKey: 'local-secret', inSync: false },
      );
    });

    it('forwards /rpc normally when in sync', async () => {
      await withRpcNode(async (nodeRpcUrl, hits) => {
        await withServer(
          async (baseUrl) => {
            const response = await post(baseUrl, rpcBody);
            expect(response.status).toBe(200);
            expect(hits()).toBe(1);
          },
          { inSync: true, nodeRpcUrl },
        );
      });
    });

    it('forwards /rpc when no local indexer is configured', async () => {
      await withRpcNode(async (nodeRpcUrl, hits) => {
        await withServer(
          async (baseUrl) => {
            expect((await post(baseUrl, rpcBody)).status).toBe(200);
            expect(hits()).toBe(1);
          },
          { localHeight: null, nodeRpcUrl, sources: ['neardata'] },
        );
      });
    });

    it('answers last_block/final with 503 on a node-only proxy', async () => {
      await withServer(
        async (baseUrl) => {
          const response = await fetch(`${baseUrl}/v0/last_block/final`, {
            redirect: 'manual',
          });
          expect(response.status).toBe(503);
        },
        { inSync: false, sources: ['node'] },
      );
    });

    it('takes the head from the next source', async () => {
      await withServer(
        async (baseUrl, state) => {
          const response = await fetch(`${baseUrl}/v0/last_block/final`, {
            redirect: 'manual',
          });
          expect(response.status).toBe(302);
          expect(response.headers.get('location')).toBe(
            `/v0/block/${HEIGHT + 2}`,
          );
          expect(state.neardata.fetchLastBlockHeight).toHaveBeenCalledOnce();
        },
        { inSync: false },
      );
    });

    it('serves a published block from the node and skips the node wait beyond it', async () => {
      const published = HEIGHT;
      await withServer(
        async (baseUrl, state) => {
          const indexer = state.localIndexer as unknown as {
            currentFinalizedHeight: ReturnType<typeof vi.fn>;
            waitForBlock: ReturnType<typeof vi.fn>;
          };
          // Even if the node still reported a head ahead of what it published.
          indexer.currentFinalizedHeight.mockReturnValue(published + 1);
          indexer.waitForBlock.mockImplementation(async (height: number) =>
            height <= published
              ? { bytes: blockBytes, source: 'node' }
              : new Promise((resolve) => setTimeout(resolve, 1000)),
          );

          const old = await fetch(`${baseUrl}/v0/block/${published}`);
          expect(old.status).toBe(200);
          expect(old.headers.get('x-upstream-source')).toBe('node');

          const started = Date.now();
          const ahead = await fetch(`${baseUrl}/v0/block/${published + 1}`);
          expect(ahead.status).toBe(200);
          expect(ahead.headers.get('x-upstream-source')).toBe('neardata');
          // upstreamTimeoutMs is 1000 here; waiting on the node would take that.
          expect(Date.now() - started).toBeLessThan(300);
          expect(indexer.waitForBlock).not.toHaveBeenCalledWith(published + 1);
        },
        { block: nextBlockBytes, inSync: false, publishedHeight: HEIGHT },
      );
    });
  });

  it('answers tip misses from a fresh head without another lookup', async () => {
    await withServer(
      async (baseUrl, state) => {
        const head = vi.mocked(state.neardata.fetchLastBlockHeight);
        for (let i = 0; i < 5; i++) {
          // Past the 100ms head cache, within the 1s miss window.
          if (i) await new Promise((resolve) => setTimeout(resolve, 150));
          const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 3}`);
          expect(response.status).toBe(404);
          expect(await response.json()).toMatchObject({
            type: 'BLOCK_DOES_NOT_EXIST',
          });
        }
        // One head lookup for five misses; main made none, the 100ms cache
        // alone would make one per poll interval.
        expect(head).toHaveBeenCalledOnce();
      },
      { finalHeight: HEIGHT, localHeight: null, sources: ['neardata'] },
    );
  });

  it('does not cache a future-block 404', async () => {
    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT + 1000}`);
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe('no-store');
        const tooHigh = await fetch(`${baseUrl}/v0/block/1000000000000001`);
        expect(tooHigh.headers.get('cache-control')).toMatch(/max-age=86400/);
      },
      { localHeight: HEIGHT, sources: ['node', 'neardata'] },
    );
  });

  it('forwards the checked JSON-RPC body, not raw bytes with duplicate keys', async () => {
    const received: string[] = [];
    const rpcUpstream = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        received.push(Buffer.concat(chunks).toString('utf8'));
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ id: 1, jsonrpc: '2.0', result: 'ok' }));
      });
    });
    rpcUpstream.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) =>
      rpcUpstream.once('listening', resolve),
    );
    const { port } = rpcUpstream.address() as AddressInfo;
    const post = (baseUrl: string, body: string) =>
      fetch(`${baseUrl}/rpc`, {
        body,
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
    try {
      await withServer(
        async (baseUrl) => {
          const smuggled = await post(
            baseUrl,
            '{"id":1,"jsonrpc":"2.0","method":"broadcast_tx_commit","method":"block","params":{"block_id":12345678901234567890}}',
          );
          expect(smuggled.status).toBe(200);
          expect(received).toHaveLength(1);
          // One method key, and the oversized integer kept exact.
          expect(received[0]).not.toContain('broadcast_tx_commit');
          expect(received[0]).toContain('12345678901234567890');

          const batch = JSON.stringify(
            Array.from({ length: 101 }, (_, id) => ({
              id,
              jsonrpc: '2.0',
              method: 'block',
            })),
          );
          expect((await post(baseUrl, batch)).status).toBe(400);
          expect(received).toHaveLength(1);
        },
        { nodeRpcUrl: `http://127.0.0.1:${port}` },
      );
    } finally {
      rpcUpstream.closeAllConnections();
      await new Promise<void>((resolve) => rpcUpstream.close(() => resolve()));
    }
  });

  it('survives an invalid Host header on an upstream redirect', async () => {
    await withServer(async (baseUrl, state) => {
      (
        state.blockProxy as unknown as { fetch: ReturnType<typeof vi.fn> }
      ).fetch = vi
        .fn()
        .mockRejectedValue(
          new UpstreamRedirectError('/v0/block/1?apiKey=secret'),
        );
      const { port } = new URL(baseUrl);
      const net = await import('node:net');
      const reply = await new Promise<string>((resolve, reject) => {
        const socket = net.connect(Number(port), '127.0.0.1', () => {
          socket.write(
            `GET /v0/block/${HEIGHT} HTTP/1.1\r\nHost: a b\r\nConnection: close\r\n\r\n`,
          );
        });
        let data = '';
        socket.on('data', (chunk) => (data += chunk));
        socket.on('end', () => resolve(data));
        socket.on('error', reject);
      });
      // Answered (the redirect, or a 4xx from the HTTP parser), not crashed.
      expect(reply).toMatch(/^HTTP\/1\.1 (302|400)/);
      expect(reply).not.toContain('secret');
      // Still serving.
      expect((await fetch(`${baseUrl}/healthz`)).status).toBe(200);
    }, PROXY_ONLY);
  });

  it('marks block responses private when a client key is required', async () => {
    await withServer(
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`, {
          headers: { authorization: 'Bearer secret' },
        });
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toMatch(/^private,/);
      },
      { apiKey: 'secret', block: blockBytes, localHeight: null },
    );
  });

  it('strips upstream keys from relative redirect locations and retains the client key', async () => {
    await withServer(async (baseUrl, state) => {
      const fetchBlock = (
        state.blockProxy as unknown as { fetch: ReturnType<typeof vi.fn> }
      ).fetch;
      fetchBlock.mockRejectedValue(
        new UpstreamRedirectError(
          `/v0/block/${HEIGHT}?apiKey=upstream-secret&x=1`,
        ),
      );
      const response = await fetch(
        `${baseUrl}/v0/block/${HEIGHT}?api_key=client-secret`,
        { redirect: 'manual' },
      );
      expect(response.headers.get('location')).toBe(
        `/v0/block/${HEIGHT}?x=1&api_key=client-secret`,
      );
    }, PROXY_ONLY);
  });

  it('does not send the client key to an external archive redirect', async () => {
    await withServer(async (baseUrl, state) => {
      const fetchBlock = (
        state.blockProxy as unknown as { fetch: ReturnType<typeof vi.fn> }
      ).fetch;
      fetchBlock.mockRejectedValue(
        new UpstreamRedirectError(
          `https://archive.example/v0/block/${HEIGHT}?apiKey=upstream-secret`,
        ),
      );
      const response = await fetch(
        `${baseUrl}/v0/block/${HEIGHT}?api_key=client-secret&format=raw`,
        { redirect: 'manual' },
      );
      expect(response.headers.get('location')).toBe(
        `https://archive.example/v0/block/${HEIGHT}?format=raw`,
      );
    }, PROXY_ONLY);
  });

  it('allows wildcard CORS without credentialed requests', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`, {
        headers: { origin: 'https://developer.example' },
        method: 'OPTIONS',
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(
        response.headers.get('access-control-allow-credentials'),
      ).toBeNull();
    });
  });

  it('does not expose routes outside the supported indexer API', async () => {
    await withServer(async (baseUrl) => {
      expect(
        (await fetch(`${baseUrl}/v0/block/${HEIGHT}/headers`)).status,
      ).toBe(404);
      expect((await fetch(`${baseUrl}/v0/first_block`)).status).toBe(404);
      expect((await fetch(`${baseUrl}/v0/last_block/optimistic`)).status).toBe(
        404,
      );
    });
  });
});

describe('per-client keys and usage metrics', () => {
  const count = async (
    metric: {
      get: () => Promise<{ values: Array<{ labels: object; value: number }> }>;
    },
    labels: Record<string, string>,
  ) =>
    (await metric.get()).values
      .filter((item) =>
        Object.entries(labels).every(
          ([name, value]) =>
            (item.labels as Record<string, unknown>)[name] === value,
        ),
      )
      .reduce((total, item) => total + item.value, 0);

  it('accepts each named key and labels RPC usage by client, method and result', async () => {
    const rpcUpstream = createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.setHeader('content-type', 'application/json');
        res.end('{"jsonrpc":"2.0","id":1,"result":{}}');
      });
    });
    rpcUpstream.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) =>
      rpcUpstream.once('listening', resolve),
    );
    const { port } = rpcUpstream.address() as AddressInfo;
    const post = (baseUrl: string, key: string, body: unknown) =>
      fetch(`${baseUrl}/rpc`, {
        body: typeof body === 'string' ? body : JSON.stringify(body),
        headers: { authorization: `Bearer ${key}` },
        method: 'POST',
      });
    try {
      await withServer(
        async (baseUrl, state) => {
          state.config = {
            ...state.config,
            proxyClients: [
              { key: 'backend-key', name: 'backend' },
              { key: 'api-key', name: 'api' },
            ],
          } as never;
          const status = {
            id: 1,
            jsonrpc: '2.0',
            method: 'status',
            params: [],
          };
          const before = {
            api: await count(metrics.rpcRequests, {
              client: 'api',
              method: 'status',
              result: 'ok',
            }),
            backend: await count(metrics.rpcRequests, {
              client: 'backend',
              method: 'status',
              result: 'ok',
            }),
            invalid: await count(metrics.rpcRequests, {
              client: 'api',
              method: 'invalid',
              result: 'invalid',
            }),
            notAllowed: await count(metrics.rpcRequests, {
              client: 'api',
              method: 'other',
              result: 'not_allowed',
            }),
          };

          expect((await post(baseUrl, 'backend-key', status)).status).toBe(200);
          expect((await post(baseUrl, 'api-key', status)).status).toBe(200);
          expect((await post(baseUrl, 'api-key', status)).status).toBe(200);
          expect((await post(baseUrl, 'wrong', status)).status).toBe(403);
          // A caller-chosen method name must never become a label value.
          await post(baseUrl, 'api-key', { ...status, method: 'made_up' });
          await post(baseUrl, 'api-key', 'not json');

          expect(
            (await count(metrics.rpcRequests, {
              client: 'backend',
              method: 'status',
              result: 'ok',
            })) - before.backend,
          ).toBe(1);
          expect(
            (await count(metrics.rpcRequests, {
              client: 'api',
              method: 'status',
              result: 'ok',
            })) - before.api,
          ).toBe(2);
          expect(
            (await count(metrics.rpcRequests, {
              client: 'api',
              method: 'other',
              result: 'not_allowed',
            })) - before.notAllowed,
          ).toBe(1);
          expect(
            (await count(metrics.rpcRequests, {
              client: 'api',
              method: 'invalid',
              result: 'invalid',
            })) - before.invalid,
          ).toBe(1);
          expect(await count(metrics.rpcRequests, { method: 'made_up' })).toBe(
            0,
          );
        },
        { nodeRpcUrl: `http://127.0.0.1:${port}`, sources: ['neardata'] },
      );
    } finally {
      rpcUpstream.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        rpcUpstream.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it('counts served blocks by client and source', async () => {
    await withServer(
      async (baseUrl, state) => {
        state.config = {
          ...state.config,
          proxyClients: [{ key: 'k8s-key', name: 'k8s' }],
        } as never;
        const labels = { client: 'k8s', source: 'neardata' };
        const before = await count(metrics.blocksServed, labels);
        const response = await fetch(`${baseUrl}/v0/block/${HEIGHT}`, {
          headers: { 'x-api-key': 'k8s-key' },
        });
        expect(response.status).toBe(200);
        expect((await count(metrics.blocksServed, labels)) - before).toBe(1);
      },
      { block: blockBytes, localHeight: null, sources: ['neardata'] },
    );
  });

  it('keeps a single PROXY_API_KEY working as the default client', async () => {
    await withServer(
      async (baseUrl) => {
        const labels = { client: 'default', source: 'neardata' };
        const before = await count(metrics.blocksServed, labels);
        expect(
          (await fetch(`${baseUrl}/v0/block/${HEIGHT}?api_key=only-key`))
            .status,
        ).toBe(200);
        expect((await count(metrics.blocksServed, labels)) - before).toBe(1);
      },
      {
        apiKey: 'only-key',
        block: blockBytes,
        localHeight: null,
        sources: ['neardata'],
      },
    );
  });
});
