import { beforeEach, describe, expect, it, vi } from 'vitest';

const readFile = vi.fn();
const mkdir = vi.fn();
const writeFile = vi.fn();
const rename = vi.fn();

vi.mock('node:fs/promises', () => ({
  default: { mkdir, readFile, rename, unlink: vi.fn(), writeFile },
}));

const { CacheStore } = await import('./index.js');

const config = {
  cacheCompression: false,
  cacheDir: '/tmp/does-not-matter',
  cacheTtlSecs: 3600,
} as never;

const hang = () => new Promise(() => {});

// Drain the microtasks a chained fs sequence queues.
const flush = async () => {
  for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(0);
};
const stall = async (store: { read: (h: number) => Promise<unknown> }) => {
  const pending = store.read(1).catch(() => null);
  await vi.advanceTimersByTimeAsync(5_000);
  await pending;
};

describe('CacheStore breaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('disables the cache after repeated stalled reads', async () => {
    readFile.mockImplementation(hang);
    const store = new CacheStore(config);

    await stall(store);
    await stall(store);
    expect(store.isDisabled).toBe(false);

    await stall(store);
    expect(store.isDisabled).toBe(true);
  });

  it('serves a miss without touching the disk once disabled', async () => {
    readFile.mockImplementation(hang);
    const store = new CacheStore(config);

    for (let i = 0; i < 3; i++) await stall(store);
    readFile.mockClear();

    await expect(store.read(2)).resolves.toBeNull();
    expect(readFile).not.toHaveBeenCalled();
  });

  it('does not write once disabled', async () => {
    readFile.mockImplementation(hang);
    mkdir.mockResolvedValue(undefined);
    writeFile.mockResolvedValue(undefined);
    rename.mockResolvedValue(undefined);
    const store = new CacheStore(config);

    // Must be a real block or write() rejects on validation before any I/O,
    // and the assertion would pass whether the gate exists or not.
    const block = Buffer.from(
      JSON.stringify({ block: { header: { height: 1 } } }),
    );

    store.writeBackground(1, block);
    await flush();
    expect(mkdir).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 3; i++) await stall(store);
    mkdir.mockClear();
    writeFile.mockClear();

    store.writeBackground(1, block);
    await flush();

    expect(mkdir).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  // A volume that answers is healthy, so an isolated slow read must not count
  // toward disabling the cache for the life of the process.
  it('resets the count when an operation completes', async () => {
    const store = new CacheStore(config);

    readFile.mockImplementation(hang);
    await stall(store);
    await stall(store);

    readFile.mockRejectedValue(
      Object.assign(new Error('missing'), { code: 'ENOENT' }),
    );
    await expect(store.read(3)).resolves.toBeNull();

    readFile.mockImplementation(hang);
    await stall(store);
    await stall(store);

    expect(store.isDisabled).toBe(false);
  });
});
