import { logger } from 'nb-logger';

import { dbBase, dbContract, dbEvents } from '#libs/knex';
import { chunks } from '#libs/utils';
import { Candidate, CodeHashFamily, PendingFamily } from '#types/types';

const CHUNK = 5_000;
const UNDEFINED_TABLE = '42P01';

const isUndefinedTable = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: string }).code === UNDEFINED_TABLE;

const codeHashesAsOf = async (
  contracts: string[],
  bucketEnd: bigint,
): Promise<Map<string, string>> => {
  const result = new Map<string, string>();

  for (const batch of chunks(contracts, CHUNK)) {
    const rows = await dbContract('contract_code_events')
      .distinctOn('contract_account_id')
      .whereIn('contract_account_id', batch)
      .where('block_timestamp', '<', bucketEnd.toString())
      .whereNotNull('code_hash')
      .orderBy('contract_account_id')
      .orderBy('block_timestamp', 'desc')
      .select('contract_account_id as contract', 'code_hash');

    for (const row of rows) result.set(row.contract, row.code_hash);
  }

  return result;
};

const heightsFor = async (
  timestamps: string[],
): Promise<Map<string, number>> => {
  const heights = new Map<string, number>();
  if (!timestamps.length) return heights;

  const sorted = [...timestamps].sort();
  const min = sorted[0] as string;
  const max = sorted[sorted.length - 1] as string;

  for (const batch of chunks(timestamps, CHUNK)) {
    const rows = await dbBase('blocks')
      .whereIn('block_timestamp', batch)
      .where('block_timestamp', '>=', min)
      .where('block_timestamp', '<=', max)
      .select<{ block_height: string; block_timestamp: string }[]>(
        'block_timestamp',
        'block_height',
      );

    for (const row of rows) {
      heights.set(String(row.block_timestamp), Number(row.block_height));
    }
  }

  return heights;
};

export const loadAlreadyResolvedContracts = async (): Promise<Set<string>> => {
  try {
    const rows = await dbEvents('ft_contract_layouts')
      .whereNot('status', 'pending')
      .pluck('contract');

    return new Set(rows);
  } catch (error) {
    if (!isUndefinedTable(error)) throw error;
    logger.warn('ft_contract_layouts does not exist yet, treating as fresh...');
    return new Set();
  }
};

export const buildFamilies = async (
  candidates: Candidate[],
  bucketEnd: bigint,
  resolvedContracts: Set<string>,
): Promise<CodeHashFamily[]> => {
  const unresolved = candidates.filter(
    (entry) => !resolvedContracts.has(entry.contract),
  );
  if (!unresolved.length) return [];

  const codeHashByContract = await codeHashesAsOf(
    unresolved.map((entry) => entry.contract),
    bucketEnd,
  );

  const byHash = new Map<string, PendingFamily>();
  let dropped = 0;

  for (const entry of unresolved) {
    const codeHash = codeHashByContract.get(entry.contract);

    if (!codeHash) {
      dropped++;
      continue;
    }

    const existing = byHash.get(codeHash);

    if (existing) {
      existing.contracts.push(entry.contract);
      continue;
    }

    byHash.set(codeHash, {
      blockTimestamp: entry.blockTimestamp,
      codeHash,
      contracts: [entry.contract],
    });
  }

  const pending = [...byHash.values()];
  const heights = await heightsFor([
    ...new Set(pending.map((family) => family.blockTimestamp)),
  ]);

  const families: CodeHashFamily[] = [];

  for (const family of pending) {
    const blockHeight = heights.get(family.blockTimestamp);
    if (blockHeight === undefined) continue;

    families.push({
      blockHeight,
      codeHash: family.codeHash,
      contracts: family.contracts,
    });
  }

  logger.info(
    `families: ${families.length}, code_hash groups: ${byHash.size}, ` +
      `no contract: ${dropped}, resolved: ${
        candidates.length - unresolved.length
      }`,
  );

  return families;
};
