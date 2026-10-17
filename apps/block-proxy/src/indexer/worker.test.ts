import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

import { describe, expect, it } from 'vitest';

import { blockHeightToPath } from '../cache/path.js';
import type { IndexerBlock } from './receipts.js';

const ZERO = '11111111111111111111111111111111';
function message(
  height: number,
  hash: string,
  prev: string,
  tx = false,
  execute = false,
): IndexerBlock {
  return {
    block: {
      chunks: [{ height_included: height, shard_id: 0 }],
      header: {
        hash,
        height,
        prev_hash: prev,
        timestamp_nanosec: String(BigInt(Date.now()) * 1_000_000n),
      },
    },
    shards: [
      {
        chunk: {
          transactions: tx
            ? [
                {
                  outcome: {
                    execution_outcome: { outcome: { receipt_ids: ['a'] } },
                  },
                  transaction: { hash: 'tx' },
                },
              ]
            : [],
        },
        receipt_execution_outcomes: execute
          ? [
              {
                execution_outcome: { outcome: { receipt_ids: ['child'] } },
                receipt: { receipt_id: 'a' },
              },
            ]
          : [],
        shard_id: 0,
      },
    ],
    tracked_shards: [0],
  };
}

describe('finalized worker (built artifact)', () => {
  it('follows skipped heights, publishes origin hashes and restores from cached replay', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-worker-'));
    const cacheDir = path.join(dir, 'cache');
    const stateDir = path.join(dir, 'state');
    const values = [
      message(100, 'b100', ZERO, true),
      message(102, 'b102', 'b100'),
      message(103, 'b103', 'b102', false, true),
      message(104, 'b104', 'b103'),
    ];
    values[0].shards[0].chunk!.transactions[0].outcome.execution_outcome.outcome.receipt_ids.push(
      'oldpending',
    );
    let head = values[1];
    const server = http.createServer(async (req, res) => {
      let input = '';
      for await (const chunk of req) input += chunk;
      const { method, params } = JSON.parse(input);
      const value = values.find(
        (v) =>
          v.block.header.hash === (params.block_id ?? params.block_hash) ||
          v.block.header.height === params.block_id,
      );
      const result =
        method === 'status'
          ? { chain_id: 'testnet', genesis_hash: 'genesis' }
          : method === 'block'
            ? params.finality
              ? head.block
              : value?.block
            : value;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ result }));
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const port = (server.address() as { port: number }).port;
    const start = (replayBlocks = 250): Worker =>
      new Worker(new URL('../../dist/indexer/worker.js', import.meta.url), {
        workerData: {
          cacheDir,
          cacheTtlSecs: 3600,
          intervalMs: 20,
          maxCatchupBlocks: 100,
          maxPendingReceipts: 100,
          network: 'testnet',
          replayBlocks,
          rpcUrl: `http://127.0.0.1:${port}`,
          stateDir,
          timeoutMs: 1000,
        },
      });
    const wait = (
      worker: Worker,
      predicate: (value: Record<string, unknown>) => boolean,
    ): Promise<Record<string, unknown>> =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          worker.off('message', receive);
          reject(new Error('worker timeout'));
        }, 5000);
        const receive = (value: Record<string, unknown>): void => {
          if (value.type === 'error') {
            clearTimeout(timer);
            worker.off('message', receive);
            reject(new Error(String(value.error)));
          } else if (predicate(value)) {
            clearTimeout(timer);
            worker.off('message', receive);
            resolve(value);
          }
        };
        worker.on('message', receive);
      });
    let worker = start();
    try {
      await wait(worker, (v) => v.type === 'healthy');
      expect(
        JSON.parse(
          await fs.readFile(
            path.join(stateDir, 'skipped-heights.json'),
            'utf8',
          ),
        ),
      ).toContainEqual(expect.objectContaining({ height: 101 }));
      // Block-file publication succeeds, but checkpoint publication fails.
      await fs.mkdir(path.join(stateDir, 'checkpoint.json'), {
        recursive: true,
      });
      const failed = new Promise<void>((resolve) => {
        const receive = (value: Record<string, unknown>): void => {
          if (value.type === 'error') {
            worker.off('message', receive);
            resolve();
          }
        };
        worker.on('message', receive);
      });
      head = values[2];
      await failed;
      const published = wait(
        worker,
        (v) => v.type === 'published' && v.height === 103,
      );
      await fs.rmdir(path.join(stateDir, 'checkpoint.json'));
      await published;
      const bytes = await fs.readFile(
        blockHeightToPath(cacheDir, 103, false),
        'utf8',
      );
      expect(
        JSON.parse(bytes).shards[0].receipt_execution_outcomes[0].tx_hash,
      ).toBe('tx');
      await worker.terminate();
      // Restore child ancestry from enriched replay even without the original transaction.
      values[3].shards[0].receipt_execution_outcomes.push({
        execution_outcome: { outcome: { receipt_ids: [] } },
        receipt: { receipt_id: 'child' },
      });
      worker = start();
      await wait(worker, (v) => v.type === 'healthy');
      const next = wait(
        worker,
        (v) => v.type === 'published' && v.height === 104,
      );
      head = values[3];
      await next;
      expect(
        JSON.parse(
          await fs.readFile(blockHeightToPath(cacheDir, 104, false), 'utf8'),
        ).shards[0].receipt_execution_outcomes[0].tx_hash,
      ).toBe('tx');
      await worker.terminate();
      worker = start(1);
      await wait(worker, (v) => v.type === 'healthy');
      const unknown = message(105, 'b105', 'b104', false, true);
      // Origin predates replay; do not publish a fabricated or null tx_hash.
      unknown.shards[0].receipt_execution_outcomes[0].receipt.receipt_id =
        'oldpending';
      values.push(unknown);
      const degraded = new Promise<Record<string, unknown>>((resolve) => {
        const receive = (value: Record<string, unknown>): void => {
          if (value.type === 'error') {
            worker.off('message', receive);
            resolve(value);
          }
        };
        worker.on('message', receive);
      });
      head = unknown;
      expect(String((await degraded).error)).toMatch(
        /missing transaction origins/,
      );
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          worker.off('message', receive);
          reject(new Error('worker did not re-anchor'));
        }, 5000);
        const receive = (value: Record<string, unknown>): void => {
          if (value.type === 'reanchored') {
            clearTimeout(timer);
            worker.off('message', receive);
            resolve();
          }
        };
        worker.on('message', receive);
      });
      await expect(
        fs.readFile(path.join(stateDir, 'checkpoint.json')),
      ).rejects.toThrow();
      const afterReanchor = message(106, 'b106', 'b105');
      values.push(afterReanchor);
      const recovered = wait(
        worker,
        (v) => v.type === 'published' && v.height === 106,
      );
      head = afterReanchor;
      await recovered;
    } finally {
      await worker.terminate();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await fs.rm(dir, { recursive: true });
    }
  }, 15_000);

  it('does not let polls cut a failure backoff short', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-worker-'));
    let requests = 0;
    const server = http.createServer((req, res) => {
      requests += 1;
      req.resume();
      res.statusCode = 500;
      res.end('node unavailable');
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const port = (server.address() as { port: number }).port;
    const worker = new Worker(
      new URL('../../dist/indexer/worker.js', import.meta.url),
      {
        workerData: {
          cacheDir: path.join(dir, 'cache'),
          cacheTtlSecs: 3600,
          intervalMs: 50,
          maxCatchupBlocks: 100,
          maxPendingReceipts: 100,
          network: 'testnet',
          replayBlocks: 250,
          rpcUrl: `http://127.0.0.1:${port}`,
          stateDir: path.join(dir, 'state'),
          timeoutMs: 1000,
        },
      },
    );
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const before = requests;
      const poller = setInterval(() => worker.postMessage('poll'), 5);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      clearInterval(poller);
      // Backoff doubles from 100ms; unthrottled polls would cause ~100+ calls.
      expect(requests - before).toBeLessThan(10);
    } finally {
      await worker.terminate();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await fs.rm(dir, { force: true, recursive: true });
    }
  }, 15_000);
});
