import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  durableWrite,
  pruneSkippedHeights,
  readCheckpoint,
  readSkippedHeights,
} from './storage.js';

const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await fs.rm(directory, { recursive: true });
});

describe('publication checkpoint', () => {
  it('reads legacy skipped heights and prunes records past the cache TTL', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-skipped-'));
    directories.push(dir);
    const file = path.join(dir, 'skipped-heights.json');
    await fs.writeFile(file, '[101]');
    const legacy = await readSkippedHeights(file);
    expect(legacy.has(101)).toBe(true);

    const entries = new Map([
      [101, 1_000],
      [102, 9_000],
    ]);
    expect(pruneSkippedHeights(entries, 10_000, 2)).toEqual([101]);
    expect(entries).toEqual(new Map([[102, 9_000]]));
  });

  it('syncs existing shard ancestry that another cache writer created', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-checkpoint-'));
    directories.push(dir);
    const leaf = path.join(dir, '000000', '123');
    await fs.mkdir(leaf, { recursive: true });
    const open = vi.spyOn(fs, 'open');
    try {
      await durableWrite(path.join(leaf, 'block.json'), Buffer.from('{}'), dir);
      const opened = open.mock.calls.map(([file]) => String(file));
      expect(opened).toContain(path.join(dir, '000000'));
      expect(opened).toContain(dir);
      expect(opened).toContain(path.dirname(dir));
    } finally {
      open.mockRestore();
    }
  });
  it('syncs newly created directory ancestry as well as the published leaf', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-checkpoint-'));
    directories.push(dir);
    const open = vi.spyOn(fs, 'open');
    try {
      await durableWrite(
        path.join(dir, 'cache', '000000', '123', 'block.json'),
        Buffer.from('{}'),
      );
      const opened = open.mock.calls.map(([file]) => String(file));
      expect(opened).toContain(dir);
      expect(opened).toContain(path.join(dir, 'cache'));
      expect(opened).toContain(path.join(dir, 'cache', '000000'));
    } finally {
      open.mockRestore();
    }
  });

  it('does not introduce a filesystem reserve query when disabled', async () => {
    const { ensureFreeSpace } = await import('./storage.js');
    const stat = vi.spyOn(fs, 'statfs');
    try {
      await ensureFreeSpace('/not-used', 0, 100);
      expect(stat).not.toHaveBeenCalled();
    } finally {
      stat.mockRestore();
    }
  });
  it('round-trips a durable checkpoint without leaving temporary files', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-checkpoint-'));
    directories.push(dir);
    const file = path.join(dir, 'checkpoint.json');
    expect(await readCheckpoint(file)).toBeNull();
    const value = {
      chainId: 'testnet',
      genesisHash: 'genesis',
      hash: 'block',
      height: 103,
      version: 1,
    };
    await durableWrite(file, Buffer.from(JSON.stringify(value)));
    expect(await readCheckpoint(file)).toEqual(value);
    expect(await fs.readdir(dir)).toEqual(['checkpoint.json']);
  });

  it('does not silently reset a corrupt checkpoint', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'proxy-checkpoint-'));
    directories.push(dir);
    const file = path.join(dir, 'checkpoint.json');
    await fs.writeFile(file, '{}');
    await expect(readCheckpoint(file)).rejects.toThrow(/invalid/);
  });
});
