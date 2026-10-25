import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

import { describe, expect, it } from 'vitest';

const ZERO = '11111111111111111111111111111111';

/** A linear chain b{low}..b{high}; anything else is unknown to the node. */
function chainNode(low: number, high: number) {
  const state = {
    failIndexerOnce: new Set<number>(),
    head: high,
  };
  const block = (height: number) => ({
    chunks: [{ height_included: height, shard_id: 0 }],
    header: {
      hash: `b${height}`,
      height,
      prev_hash: height === low ? ZERO : `b${height - 1}`,
      timestamp_nanosec: String(BigInt(Date.now()) * 1_000_000n),
    },
  });
  const heightOf = (id: unknown): null | number => {
    const height =
      typeof id === 'number' ? id : Number(String(id ?? '').slice(1));
    return Number.isInteger(height) && height >= low && height <= state.head
      ? height
      : null;
  };
  const server = http.createServer(async (req, res) => {
    let input = '';
    for await (const chunk of req) input += chunk;
    const { method, params } = JSON.parse(input);
    res.setHeader('content-type', 'application/json');
    const unknown = () =>
      res.end(
        JSON.stringify({
          error: { cause: { name: 'UNKNOWN_BLOCK' }, name: 'HANDLER_ERROR' },
        }),
      );
    if (method === 'status') {
      res.end(
        JSON.stringify({
          result: { chain_id: 'testnet', genesis_hash: 'genesis' },
        }),
      );
      return;
    }
    if (method === 'block') {
      const height = params.finality ? state.head : heightOf(params.block_id);
      if (height === null) {
        unknown();
        return;
      }
      res.end(JSON.stringify({ result: block(height) }));
      return;
    }
    const height = heightOf(params.block_hash);
    if (height === null) {
      unknown();
      return;
    }
    if (state.failIndexerOnce.delete(height)) {
      res.statusCode = 500;
      res.end('{}');
      return;
    }
    res.end(
      JSON.stringify({
        result: {
          block: block(height),
          shards: [
            {
              chunk: { transactions: [] },
              receipt_execution_outcomes: [],
              shard_id: 0,
            },
          ],
          tracked_shards: [0],
        },
      }),
    );
  });
  return { server, state };
}

async function run(
  node: ReturnType<typeof chainNode>,
  setup: (dirs: { stateDir: string }) => Promise<void>,
  until: (seen: Record<string, unknown>[]) => boolean,
): Promise<Record<string, unknown>[]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-recovery-'));
  const stateDir = path.join(dir, 'state');
  await fs.mkdir(stateDir, { recursive: true });
  await setup({ stateDir });
  await new Promise<void>((resolve) =>
    node.server.listen(0, '127.0.0.1', resolve),
  );
  const port = (node.server.address() as { port: number }).port;
  const worker = new Worker(
    new URL('../../dist/indexer/worker.js', import.meta.url),
    {
      workerData: {
        cacheDir: path.join(dir, 'cache'),
        cacheTtlSecs: 3600,
        intervalMs: 20,
        maxCatchupBlocks: 100,
        maxPendingReceipts: 100,
        network: 'testnet',
        replayBlocks: 5,
        rpcUrl: `http://127.0.0.1:${port}`,
        stateDir,
        timeoutMs: 1000,
      },
    },
  );
  const seen: Record<string, unknown>[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`timeout: ${JSON.stringify(seen)}`)),
        8000,
      );
      worker.on('message', (value: Record<string, unknown>) => {
        seen.push({ ...value, bytes: undefined });
        if (until(seen)) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
  } finally {
    worker.postMessage('stop');
    await worker.terminate();
    node.server.close();
    await fs.rm(dir, { force: true, recursive: true });
  }
  return seen;
}

describe('worker recovery (built artifact)', () => {
  it('does not mark real heights skipped after a failed warm-up', async () => {
    const node = chainNode(1, 10);
    // Warm-up fails on block 8 once; meanwhile the head moves on.
    node.state.failIndexerOnce.add(8);
    let failed = false;
    const seen = await run(
      node,
      async () => {},
      (values) => {
        if (!failed && values.some((value) => value.type === 'error')) {
          failed = true;
          node.state.head = 20;
        }
        return failed && values.some((value) => value.type === 'healthy');
      },
    );
    expect(seen.filter((value) => value.type === 'skipped')).toEqual([]);
  }, 15_000);

  it('re-anchors when the checkpoint is older than the node retains', async () => {
    const node = chainNode(100, 120);
    const seen = await run(
      node,
      async ({ stateDir }) => {
        await fs.writeFile(
          path.join(stateDir, 'checkpoint.json'),
          JSON.stringify({
            chainId: 'testnet',
            genesisHash: 'genesis',
            hash: 'b5',
            height: 5,
            version: 1,
          }),
        );
      },
      (values) =>
        values.some((value) => value.type === 'reanchored') &&
        values.some((value) => value.type === 'healthy'),
    );
    expect(seen.find((value) => value.type === 'reanchored')).toMatchObject({
      height: 120,
    });
  }, 15_000);
});
