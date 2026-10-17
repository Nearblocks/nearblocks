import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface Checkpoint {
  chainId: string;
  genesisHash: string;
  hash: string;
  height: number;
  version: 1;
}

export async function ensureFreeSpace(
  directory: string,
  minimumBytes: number,
  writeBytes: number,
): Promise<void> {
  if (minimumBytes <= 0) return;
  await durableDirectory(directory);
  const stat = await fs.statfs(directory, { bigint: true });
  if (stat.bavail * stat.bsize < BigInt(minimumBytes) + BigInt(writeBytes)) {
    throw new Error('cache writes paused to preserve node filesystem reserve');
  }
}

async function syncDirectory(directory: string): Promise<void> {
  const handle = await fs.open(directory, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function durableDirectory(directory: string): Promise<void> {
  const firstCreated = await fs.mkdir(directory, { recursive: true });
  if (!firstCreated) return;
  let current = path.resolve(directory);
  const first = path.resolve(firstCreated);
  while (true) {
    await syncDirectory(current);
    if (current === first) break;
    current = path.dirname(current);
  }
  // Persist the entry of the first new directory in its existing parent too.
  await syncDirectory(path.dirname(first));
}

export async function durableWrite(
  file: string,
  bytes: Uint8Array,
  directoryRoot = path.dirname(file),
): Promise<void> {
  const root = path.resolve(directoryRoot);
  const relative = path.relative(root, path.resolve(path.dirname(file)));
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('publication path is outside its directory root');
  }
  await durableDirectory(path.dirname(file));
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    const handle = await fs.open(temporary, 'wx', 0o600);
    try {
      await handle.writeFile(bytes);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(temporary, file);
    // Another writer may have created a shard without syncing its parent yet.
    // Flush the whole bounded ancestry even when mkdir reports it existed.
    let directory = path.resolve(path.dirname(file));
    while (true) {
      await syncDirectory(directory);
      if (directory === root) break;
      directory = path.dirname(directory);
    }
    await syncDirectory(path.dirname(root));
  } finally {
    await fs.unlink(temporary).catch(() => {});
  }
}

export async function durableRemove(file: string): Promise<void> {
  await fs.unlink(file).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error;
  });
  await syncDirectory(path.dirname(file));
}

export async function readSkippedHeights(
  file: string,
): Promise<Map<number, number>> {
  try {
    const values = JSON.parse(await fs.readFile(file, 'utf8')) as unknown;
    if (!Array.isArray(values)) {
      throw new Error('invalid skipped-height index');
    }
    const entries = new Map<number, number>();
    const legacyTimestamp = Date.now();
    for (const value of values) {
      if (Number.isSafeInteger(value) && (value as number) >= 0) {
        // Preserve the old height-only format for one cache-TTL window.
        entries.set(value as number, legacyTimestamp);
        continue;
      }
      if (
        !value ||
        typeof value !== 'object' ||
        !Number.isSafeInteger((value as { height?: number }).height) ||
        (value as { height: number }).height < 0 ||
        !Number.isSafeInteger(
          (value as { recordedAtMs?: number }).recordedAtMs,
        ) ||
        (value as { recordedAtMs: number }).recordedAtMs < 0
      ) {
        throw new Error('invalid skipped-height index');
      }
      entries.set(
        (value as { height: number }).height,
        (value as { recordedAtMs: number }).recordedAtMs,
      );
    }
    return entries;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Map();
    throw error;
  }
}

export function pruneSkippedHeights(
  entries: Map<number, number>,
  now: number,
  ttlSecs: number,
): number[] {
  const cutoff = now - ttlSecs * 1000;
  const pruned: number[] = [];
  for (const [height, recordedAtMs] of entries) {
    if (recordedAtMs < cutoff) {
      entries.delete(height);
      pruned.push(height);
    }
  }
  return pruned;
}

export async function readCheckpoint(file: string): Promise<Checkpoint | null> {
  try {
    const value = JSON.parse(await fs.readFile(file, 'utf8')) as Checkpoint;
    if (
      value.version !== 1 ||
      !Number.isSafeInteger(value.height) ||
      value.height < 0 ||
      !value.hash ||
      !value.chainId ||
      !value.genesisHash
    ) {
      throw new Error('invalid indexer checkpoint');
    }
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
