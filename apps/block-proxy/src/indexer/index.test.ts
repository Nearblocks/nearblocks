import type { EventEmitter } from 'node:events';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalIndexer } from './index.js';

const mocks = vi.hoisted(() => ({ workers: [] as EventEmitter[] }));
vi.mock('node:worker_threads', async () => {
  const { EventEmitter } = await import('node:events');
  return {
    Worker: class extends EventEmitter {
      constructor() {
        super();
        mocks.workers.push(this);
      }
      postMessage(): void {}
      async terminate(): Promise<number> {
        this.emit('exit', 0);
        return 0;
      }
    },
  };
});

describe('producer join', () => {
  it('does not let an ahead request interfere with active production', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', { height: 100, type: 'processing' });
    worker.emit('message', { pending: 0, type: 'healthy' });
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    const active = indexer.waitForBlock(100);
    const ahead = indexer.waitForBlock(101);
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    expect(await ahead).toBeNull();
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 100,
      pending: 1,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    expect((await active)?.source).toBe('node');
    expect(indexer.status.published).toBe(100);
  });
  beforeEach(() => {
    mocks.workers.length = 0;
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());
  const start = (): LocalIndexer =>
    new LocalIndexer({
      exitOnWorkerFailure: false,
      indexerErrorGraceMs: 5000,
      indexerMaxHeadAgeSecs: 10,
      indexerWaitMs: 25,
      nodeMaxLagSecs: 30,
    } as never);

  describe('sync state', () => {
    const headAt = (timestampMs: number, height = 100) => ({
      height,
      timestamp: String(BigInt(timestampMs) * 1_000_000n),
      type: 'head',
    });
    const published = (height: number) => ({
      bytes: Buffer.from('{}'),
      height,
      pending: 0,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });

    it('is in sync with a healthy node and a fresh head', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', published(100));
      worker.emit('message', headAt(Date.now() - 2000));
      expect(indexer.isInSync()).toBe(true);
      expect(indexer.lagSecs()).toBeCloseTo(2, 1);
      expect(indexer.currentFinalizedHeight()).toBe(100);
    });

    it('stays in sync through one failed poll', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', published(100));
      worker.emit('message', headAt(Date.now() - 1000));
      worker.emit('message', { error: 'socket hang up', type: 'error' });
      vi.advanceTimersByTime(1000);
      expect(indexer.isInSync()).toBe(true);
      expect(indexer.currentFinalizedHeight()).toBe(100);
      worker.emit('message', headAt(Date.now() - 1000));
      worker.emit('message', { pending: 0, type: 'healthy' });
      // Recovery cancels the pending degrade.
      vi.advanceTimersByTime(10_000);
      worker.emit('message', headAt(Date.now() - 1000));
      worker.emit('message', published(101));
      expect(indexer.isInSync()).toBe(true);
      expect(indexer.status.error).toBeNull();
    });

    it('goes out of sync when failures outlast the grace period', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', published(100));
      worker.emit('message', headAt(Date.now() - 1000));
      worker.emit('message', { error: 'connection refused', type: 'error' });
      vi.advanceTimersByTime(2000);
      worker.emit('message', headAt(Date.now() - 1000));
      worker.emit('message', { error: 'connection refused', type: 'error' });
      vi.advanceTimersByTime(3001);
      worker.emit('message', headAt(Date.now() - 1000));
      expect(indexer.isInSync()).toBe(false);
      expect(indexer.currentFinalizedHeight()).toBeNull();
      expect(indexer.status.error).toBe('connection refused');
    });

    it('judges /rpc by the node alone, not the follower', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', headAt(Date.now() - 1000));
      // The follower fails (disk full, say) but the node is current.
      worker.emit('message', { error: 'disk full', type: 'error' });
      expect(indexer.isInSync()).toBe(false);
      expect(indexer.isNodeCurrent()).toBe(true);
      // With no new head, the lag grows past the limit on its own.
      vi.advanceTimersByTime(31_000);
      expect(indexer.isNodeCurrent()).toBe(false);
    });

    it('reports no head while the follower works through a backlog', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      // The node itself is current...
      worker.emit('message', headAt(Date.now() - 1000, 5000));
      // ...but the last block the follower published is minutes old.
      worker.emit('message', {
        ...published(100),
        timestamp: String(BigInt(Date.now() - 120_000) * 1_000_000n),
      });
      expect(indexer.isInSync()).toBe(true);
      expect(indexer.currentFinalizedHeight()).toBeNull();
      worker.emit('message', published(4999));
      expect(indexer.currentFinalizedHeight()).toBe(4999);
    });

    it('is out of sync when polls arrive but the head block is old', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', published(100));
      // A stuck node: every poll succeeds and returns the same old block.
      const stuck = Date.now() - 31_000;
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(250);
        worker.emit('message', headAt(stuck));
      }
      expect(indexer.isInSync()).toBe(false);
      expect(indexer.lagSecs()).toBeGreaterThan(30);
      expect(indexer.currentFinalizedHeight()).toBeNull();
      expect(indexer.status.published).toBe(100);
    });

    it('does not wait for unpublished heights while out of sync', async () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', published(100));
      worker.emit('message', headAt(Date.now() - 60_000, 101));
      // Resolves without advancing timers, so no wait timer was involved.
      expect(await indexer.waitForBlock(101)).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('is back in sync after a fresh head', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', published(100));
      worker.emit('message', headAt(Date.now() - 60_000));
      expect(indexer.isInSync()).toBe(false);
      worker.emit('message', headAt(Date.now() - 1000, 101));
      expect(indexer.isInSync()).toBe(true);
      expect(indexer.currentFinalizedHeight()).toBe(100);
    });

    it('is out of sync when unhealthy or the polls stop', () => {
      const indexer = start();
      const worker = mocks.workers[0];
      expect(indexer.isInSync()).toBe(false);
      expect(indexer.lagSecs()).toBeNull();
      worker.emit('message', { pending: 0, type: 'healthy' });
      worker.emit('message', headAt(Date.now()));
      expect(indexer.isInSync()).toBe(true);
      vi.advanceTimersByTime(11_000);
      expect(indexer.isInSync()).toBe(false);
      worker.emit('message', headAt(Date.now()));
      expect(indexer.isInSync()).toBe(true);
      worker.emit('message', { error: 'boom', type: 'error' });
      // Within the grace period one error does not change the verdict.
      expect(indexer.isInSync()).toBe(true);
      vi.advanceTimersByTime(5000);
      expect(indexer.isInSync()).toBe(false);
    });
  });

  it('joins processing and returns its published bytes', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', { height: 100, type: 'processing' });
    worker.emit('message', { pending: 0, type: 'healthy' });
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    const joined = indexer.waitForBlock(100);
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 100,
      pending: 1,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    expect(await joined).toEqual({ bytes: Buffer.from('{}'), source: 'node' });
    expect(await indexer.waitForBlock(100)).toBeNull();
  });

  it('wakes the follower and waits for an already-finalized block', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', { pending: 0, type: 'healthy' });
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 99,
      pending: 0,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    worker.emit('message', {
      height: 99,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    const waiting = indexer.waitForBlock(100);
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    worker.emit('message', { height: 100, type: 'processing' });
    worker.emit('message', {
      bytes: Buffer.from('{"block":{}}'),
      height: 100,
      pending: 0,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    expect(await waiting).toEqual({
      bytes: Buffer.from('{"block":{}}'),
      source: 'node',
    });
    expect(indexer.currentFinalizedHeight()).toBe(100);
  });

  it('waits for a fresh head poll when its previously observed head is behind', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', { pending: 0, type: 'healthy' });
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 99,
      pending: 0,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    worker.emit('message', {
      height: 99,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    const waiting = indexer.waitForBlock(100);
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    worker.emit('message', { height: 100, type: 'processing' });
    worker.emit('message', {
      bytes: Buffer.from('{"block":{}}'),
      height: 100,
      pending: 0,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    expect(await waiting).toEqual({
      bytes: Buffer.from('{"block":{}}'),
      source: 'node',
    });
  });

  it('releases an ahead request when the node confirms it is not final', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', { pending: 0, type: 'healthy' });
    const waiting = indexer.waitForBlock(101);
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    expect(await waiting).toBeNull();
  });

  it('releases waiters on failure or worker exit', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', { height: 100, type: 'processing' });
    const failed = indexer.waitForBlock(100);
    worker.emit('message', { height: 100, type: 'failed' });
    expect(await failed).toBeNull();
    worker.emit('message', { height: 101, type: 'processing' });
    const exited = indexer.waitForBlock(101);
    worker.emit('exit', 1);
    expect(await exited).toBeNull();
  });

  it('bounds waiting without cancelling the follower', async () => {
    const indexer = start();
    mocks.workers[0].emit('message', { height: 100, type: 'processing' });
    const joined = indexer.waitForBlock(100);
    await vi.advanceTimersByTimeAsync(25);
    expect(await joined).toBeNull();
    mocks.workers[0].emit('message', { height: 100, type: 'failed' });
  });

  it('only advertises a fresh healthy local finalized block', () => {
    const indexer = start();
    const worker = mocks.workers[0];
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 100,
      pending: 0,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'published',
    });
    worker.emit('message', {
      height: 100,
      timestamp: String(BigInt(Date.now()) * 1_000_000n),
      type: 'head',
    });
    expect(indexer.finalBlock()).toBeNull();
    worker.emit('message', { pending: 0, type: 'healthy' });
    expect(indexer.finalBlock()).toEqual(Buffer.from('{}'));
    expect(indexer.currentFinalizedHeight()).toBe(100);
    vi.advanceTimersByTime(10_001);
    expect(indexer.finalBlock()).toBeNull();
    expect(indexer.currentFinalizedHeight()).toBeNull();
  });

  it('reports the highest published height, not the node head, while catching up', () => {
    const indexer = start();
    const worker = mocks.workers[0];
    const now = String(BigInt(Date.now()) * 1_000_000n);
    worker.emit('message', { height: 500, timestamp: now, type: 'head' });
    worker.emit('message', { pending: 0, type: 'healthy' });
    // Nothing published yet: no head to serve.
    expect(indexer.currentFinalizedHeight()).toBeNull();
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 100,
      pending: 0,
      timestamp: now,
      type: 'published',
    });
    expect(indexer.status.head).toBe(500);
    expect(indexer.currentFinalizedHeight()).toBe(100);
  });

  it('does not wait for heights far past the last published block', async () => {
    const indexer = start();
    const worker = mocks.workers[0];
    const now = String(BigInt(Date.now()) * 1_000_000n);
    worker.emit('message', { pending: 0, type: 'healthy' });
    worker.emit('message', { height: 500, timestamp: now, type: 'head' });
    worker.emit('message', {
      bytes: Buffer.from('{}'),
      height: 100,
      pending: 0,
      timestamp: now,
      type: 'published',
    });
    // Catching up: 450 is final on the node but far from published, so the
    // caller should go to the next source now (no timer needs to fire).
    expect(await indexer.waitForBlock(450)).toBeNull();
  });
});
