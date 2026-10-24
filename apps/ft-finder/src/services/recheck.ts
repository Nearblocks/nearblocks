import { logger } from 'nb-logger';
import { RPC } from 'nb-near';
import { sleep } from 'nb-utils';

import config from '#config';
import { dbBase, dbContract, dbEvents } from '#libs/knex';
import { chunks } from '#libs/utils';
import { PROBE_METHODS, succeededReceipts } from '#services/candidates';
import { heightsFor } from '#services/families';
import { resolveFamily } from '#services/resolve';
import { persistFamily } from '#services/seed';
import { CodeHashFamily } from '#types/types';

const CHUNK = 5_000;
const WINDOW_NS = 2_592_000_000_000_000n;

type Deployed = { codeHash: string; deployedAt: bigint };

type Probe = { contract: string; receiptId: string; timestamp: string };

const rejectedWithHash = async (): Promise<Map<string, string>> => {
  const rows = await dbEvents('ft_contract_layouts')
    .where('status', 'rejected')
    .whereNotNull('code_hash')
    .select<{ code_hash: string; contract: string }[]>('contract', 'code_hash');

  return new Map(rows.map((row) => [row.contract, row.code_hash]));
};

const currentCode = async (
  contracts: string[],
): Promise<Map<string, Deployed>> => {
  const current = new Map<string, Deployed>();

  for (const batch of chunks(contracts, CHUNK)) {
    const rows = await dbContract('contract_code_events')
      .distinctOn('contract_account_id')
      .whereIn('contract_account_id', batch)
      .whereNotNull('code_hash')
      .orderBy('contract_account_id')
      .orderBy('block_timestamp', 'desc')
      .select<
        { block_timestamp: string; code_hash: string; contract: string }[]
      >('contract_account_id as contract', 'code_hash', 'block_timestamp');

    for (const row of rows) {
      current.set(row.contract, {
        codeHash: row.code_hash,
        deployedAt: BigInt(row.block_timestamp),
      });
    }
  }

  return current;
};

const findProbes = async (
  pending: Map<string, Deployed>,
): Promise<Map<string, Probe>> => {
  const probes = new Map<string, Probe>();
  const nowNs = BigInt(Date.now()) * 1_000_000n;

  let remaining = [...pending.entries()];
  let start = remaining.reduce(
    (oldest, [, entry]) =>
      entry.deployedAt < oldest ? entry.deployedAt : oldest,
    remaining[0]?.[1].deployedAt ?? nowNs,
  );

  while (remaining.length && start < nowNs) {
    const end = start + WINDOW_NS;
    const eligible = remaining
      .filter(([, entry]) => entry.deployedAt < end)
      .map(([contract]) => contract);

    for (const batch of chunks(eligible, CHUNK)) {
      const rows = await dbBase('action_receipt_actions')
        .distinctOn('receipt_receiver_account_id')
        .whereIn('receipt_receiver_account_id', batch)
        .whereIn('method', PROBE_METHODS)
        .where('receipt_included_in_block_timestamp', '>=', start.toString())
        .where('receipt_included_in_block_timestamp', '<', end.toString())
        .orderBy('receipt_receiver_account_id')
        .orderBy('receipt_included_in_block_timestamp', 'desc')
        .select<{ contract: string; receipt_id: string; timestamp: string }[]>(
          'receipt_receiver_account_id as contract',
          'receipt_included_in_block_timestamp as timestamp',
          'receipt_id',
        );

      for (const row of rows) {
        const entry = pending.get(row.contract);

        if (!entry || BigInt(row.timestamp) < entry.deployedAt) continue;

        probes.set(row.contract, {
          contract: row.contract,
          receiptId: row.receipt_id,
          timestamp: row.timestamp,
        });
      }
    }

    if (eligible.length) {
      remaining = remaining.filter(([contract]) => !probes.has(contract));
    }

    start = end;
  }

  return probes;
};

export const recheckRejected = async (rpc: RPC): Promise<void> => {
  const rejected = await rejectedWithHash();

  if (!rejected.size) {
    logger.info('recheck: no rejected contracts');
    return;
  }

  const current = await currentCode([...rejected.keys()]);
  const pending = new Map<string, Deployed>();

  for (const [contract, storedHash] of rejected) {
    const entry = current.get(contract);
    if (entry && entry.codeHash !== storedHash) pending.set(contract, entry);
  }

  logger.info(
    `recheck: ${rejected.size} rejected, ${pending.size} redeployed since rejection`,
  );

  if (!pending.size) return;

  const probes = await findProbes(pending);

  logger.info(
    `recheck: ${probes.size} with a probe block, ${
      pending.size - probes.size
    } idle since redeploy`,
  );

  if (!probes.size) return;

  const found = [...probes.values()];
  const timestamps = found.map((probe) => BigInt(probe.timestamp));
  const succeeded = await succeededReceipts(
    found.map((probe) => probe.receiptId),
    timestamps.reduce((a, b) => (b < a ? b : a)),
    timestamps.reduce((a, b) => (b > a ? b : a)),
  );

  const usable = found.filter((probe) => succeeded.has(probe.receiptId));
  const heights = await heightsFor(usable.map((probe) => probe.timestamp));

  const families = new Map<string, CodeHashFamily>();

  for (const probe of usable) {
    const blockHeight = heights.get(probe.timestamp);
    const entry = pending.get(probe.contract);

    if (blockHeight === undefined || !entry) continue;

    const family = families.get(entry.codeHash);

    if (family) {
      family.contracts.push(probe.contract);
      continue;
    }

    families.set(entry.codeHash, {
      blockHeight,
      codeHash: entry.codeHash,
      contracts: [probe.contract],
    });
  }

  const tally = { pending: 0, rejected: 0, unsupported: 0, verified: 0 };

  for (const family of families.values()) {
    const resolution = await resolveFamily(
      rpc,
      family.contracts[0] as string,
      family.blockHeight,
    );

    const status = await persistFamily(
      family,
      resolution.layout,
      resolution.result,
      resolution.verifyResult,
    );

    tally[status] += family.contracts.length;

    if (config.rpcDelayMs) await sleep(config.rpcDelayMs);
  }

  logger.info(
    `recheck done, verified: ${tally.verified}, unsupported: ${tally.unsupported}, ` +
      `rejected: ${tally.rejected}, pending: ${tally.pending}`,
  );
};
