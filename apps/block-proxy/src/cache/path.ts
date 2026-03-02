import path from 'node:path';

/**
 * Converts a block height to a sharded filesystem path within cacheDir.
 *
 * Sharding strategy:
 * - Zero-pad height to 12 digits
 * - dir1 = first 6 digits (groups of 1,000,000 blocks)
 * - dir2 = next 3 digits (groups of 1,000 blocks within dir1)
 * - file = full 12-digit padded height + ".json" or ".json.zst"
 *
 * Example: height 42839521 (uncompressed)
 *   padded  = "000042839521"
 *   dir1    = "000042"
 *   dir2    = "839"
 *   result  = "{cacheDir}/000042/839/000042839521.json"
 */
export function blockHeightToPath(
  cacheDir: string,
  height: number,
  compressed: boolean,
): string {
  const padded = String(height).padStart(12, '0');
  const dir1 = padded.slice(0, 6);
  const dir2 = padded.slice(6, 9);
  const ext = compressed ? 'json.zst' : 'json';
  return path.join(cacheDir, dir1, dir2, `${padded}.${ext}`);
}
