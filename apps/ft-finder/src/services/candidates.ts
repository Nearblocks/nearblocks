import { logger } from 'nb-logger';
import { ExecutionOutcomeStatus, Network } from 'nb-types';

import config from '#config';
import { dbBase } from '#libs/knex';
import { chunks, getSyncedValue, iso, updateSyncedValue } from '#libs/utils';
import { CandidateBatch } from '#types/types';

const FT_METHODS = [
  'ft_transfer',
  'ft_transfer_call',
  'ft_resolve_transfer',
  'storage_deposit',
];

const PROBE_METHODS = ['ft_transfer', 'ft_transfer_call'];

const PROBE_METHOD_PLACEHOLDERS = PROBE_METHODS.map(() => '?').join(', ');

const SUCCESS_STATUSES = [
  ExecutionOutcomeStatus.SUCCESS_VALUE,
  ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID,
];

const OUTCOME_WINDOW_NS = 300_000_000_000n;

const CHUNK = 5_000;

const NS_IN_AN_HOUR = 3_600_000_000_000n;

const FT_START_NS: Record<Network, bigint> = {
  [Network.MAINNET]: 1_613_534_400_000_000_000n,
  [Network.TESTNET]: 1_617_307_200_000_000_000n,
};

const succeededReceipts = async (
  receiptIds: string[],
  minTimestamp: bigint,
  maxTimestamp: bigint,
): Promise<Set<string>> => {
  const succeeded = new Set<string>();

  for (const batch of chunks(receiptIds, CHUNK)) {
    const rows = await dbBase('execution_outcomes')
      .whereIn('receipt_id', batch)
      .whereIn('status', SUCCESS_STATUSES)
      .where('executed_in_block_timestamp', '>=', minTimestamp.toString())
      .where(
        'executed_in_block_timestamp',
        '<=',
        (maxTimestamp + OUTCOME_WINDOW_NS).toString(),
      )
      .pluck<string[]>('receipt_id');

    for (const receiptId of rows) succeeded.add(receiptId);
  }

  return succeeded;
};

export const iterateCandidateBatches =
  async function* (): AsyncGenerator<CandidateBatch> {
    const nowNs = BigInt(Date.now()) * 1_000_000n;
    const bucketNs = BigInt(config.bucketHours) * NS_IN_AN_HOUR;
    const synced = await getSyncedValue();
    const startFrom = synced ?? FT_START_NS[config.network];

    logger.info(`syncing from ${iso(startFrom)}`);

    for (let start = startFrom; start < nowNs; start += bucketNs) {
      const end = start + bucketNs;
      const label = iso(start).slice(0, config.bucketHours < 24 ? 13 : 10);

      const rows = await dbBase('action_receipt_actions')
        .distinctOn('receipt_receiver_account_id')
        .whereIn('method', FT_METHODS)
        .where('receipt_included_in_block_timestamp', '>=', start.toString())
        .where('receipt_included_in_block_timestamp', '<', end.toString())
        .orderByRaw(
          `receipt_receiver_account_id, (method in (${PROBE_METHOD_PLACEHOLDERS})) desc, receipt_included_in_block_timestamp desc`,
          PROBE_METHODS,
        )
        .select<{ contract: string; receipt_id: string; timestamp: string }[]>(
          'receipt_receiver_account_id as contract',
          'receipt_included_in_block_timestamp as timestamp',
          'receipt_id',
        );

      const timestamps = rows.map((row) => BigInt(row.timestamp));

      const succeeded = rows.length
        ? await succeededReceipts(
            rows.map((row) => row.receipt_id),
            timestamps.reduce((a, b) => (b < a ? b : a)),
            timestamps.reduce((a, b) => (b > a ? b : a)),
          )
        : new Set<string>();

      const contracts = rows
        .filter((row) => succeeded.has(row.receipt_id))
        .map((row) => ({
          blockTimestamp: String(row.timestamp),
          contract: row.contract,
        }));

      logger.info(
        `${label}: ${contracts.length} contracts, ${
          rows.length - contracts.length
        } skipped`,
      );

      if (contracts.length) yield { bucketEnd: end, contracts };

      await updateSyncedValue(end);
    }
  };
