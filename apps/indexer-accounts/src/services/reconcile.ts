import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import config from '#config';
import { db, tbl } from '#libs/knex';
import {
  bigIntMin,
  indexerKey,
  processWindow,
  RECEIPT_EXECUTION_CAP_NS,
} from '#services/backfill';

export type Gap = {
  count: number;
  fromTs: bigint;
  toTs: bigint;
};

type AccountRow = {
  account_id: string;
  created_by_block_timestamp: string;
};

type AccessKeyRow = {
  account_id: string;
  created_by_block_timestamp: string;
  public_key: string;
};

const groundTruth = () => config.reconcileGroundTruthSchema;
const GENESIS_TS = BigInt(config.genesisTimestamp);

export const getBackfillCursor = async (): Promise<bigint> => {
  const settings = await db(tbl('settings')).where({ key: indexerKey }).first();

  return BigInt(
    String(settings?.value?.backfillTimestamp ?? config.genesisTimestamp),
  );
};

export const findAccountGaps = async (cursor: bigint): Promise<Gap[]> => {
  const missing: bigint[] = [];
  let genesisMissing = 0;
  let pageCursor: null | string = null;
  let page = 0;

  for (;;) {
    const rows: AccountRow[] = await retry(async () => {
      const result = await db.raw(
        `
          SELECT p.account_id, p.created_by_block_timestamp
          FROM ${groundTruth()}.accounts p
          WHERE (:cursor::text IS NULL OR p.account_id > :cursor)
          ORDER BY p.account_id
          LIMIT :pageSize
        `,
        { cursor: pageCursor, pageSize: config.reconcilePageSize },
      );

      return result.rows;
    });

    if (!rows.length) {
      break;
    }

    const historicRows = rows.filter(
      (row) => BigInt(row.created_by_block_timestamp) < cursor,
    );

    if (historicRows.length) {
      const ids = historicRows.map((row) => row.account_id);
      const existing: { account_id: string }[] = await retry(async () => {
        const result = await db.raw(
          `SELECT account_id FROM ${tbl(
            'accounts',
          )} WHERE account_id = ANY(:ids)`,
          { ids },
        );

        return result.rows;
      });
      const existingIds = new Set(existing.map((row) => row.account_id));

      for (const row of historicRows) {
        if (!existingIds.has(row.account_id)) {
          const ts = BigInt(row.created_by_block_timestamp);

          if (ts === GENESIS_TS) {
            genesisMissing += 1;
            continue;
          }

          missing.push(ts);
        }
      }
    }

    pageCursor = rows[rows.length - 1].account_id;
    page += 1;

    logger.info(
      {
        genesisMissing,
        historic: historicRows.length,
        missing: missing.length,
        page,
        pageCursor,
        rows: rows.length,
      },
      'account gap scan progress',
    );

    if (rows.length < config.reconcilePageSize) {
      break;
    }
  }

  if (genesisMissing) {
    logger.warn(
      { genesisMissing },
      'accounts missing from rebuild at genesis timestamp; processWindow cannot repair genesis-sourced rows, needs a manual genesis re-sync',
    );
  }

  return bandify(missing);
};

export const findAccessKeyGaps = async (cursor: bigint): Promise<Gap[]> => {
  const missing: bigint[] = [];
  let genesisMissing = 0;
  let pageCursor: { account_id: string; public_key: string } | null = null;
  let page = 0;

  for (;;) {
    const rows: AccessKeyRow[] = await retry(async () => {
      const result = await db.raw(
        `
          SELECT p.account_id, p.public_key, p.created_by_block_timestamp
          FROM ${groundTruth()}.access_keys p
          WHERE (
            :cursorKey::text IS NULL
            OR (p.public_key, p.account_id) > (:cursorKey, :cursorAccount)
          )
          ORDER BY p.public_key, p.account_id
          LIMIT :pageSize
        `,
        {
          cursorAccount: pageCursor?.account_id ?? null,
          cursorKey: pageCursor?.public_key ?? null,
          pageSize: config.reconcilePageSize,
        },
      );

      return result.rows;
    });

    if (!rows.length) {
      break;
    }

    const historicRows = rows.filter(
      (row) => BigInt(row.created_by_block_timestamp) < cursor,
    );

    if (historicRows.length) {
      const existing: { account_id: string; public_key: string }[] =
        await retry(async () => {
          const result = await db.raw(
            `
              SELECT ak.account_id, ak.public_key
              FROM ${tbl('access_keys')} ak
              JOIN (
                SELECT
                  UNNEST(:publicKeys::text[]) AS public_key,
                  UNNEST(:accountIds::text[]) AS account_id
              ) v ON v.public_key = ak.public_key AND v.account_id = ak.account_id
            `,
            {
              accountIds: historicRows.map((row) => row.account_id),
              publicKeys: historicRows.map((row) => row.public_key),
            },
          );

          return result.rows;
        });
      const existingKeys = new Set(
        existing.map((row) => `${row.public_key}:${row.account_id}`),
      );

      for (const row of historicRows) {
        if (!existingKeys.has(`${row.public_key}:${row.account_id}`)) {
          const ts = BigInt(row.created_by_block_timestamp);

          if (ts === GENESIS_TS) {
            genesisMissing += 1;
            continue;
          }

          missing.push(ts);
        }
      }
    }

    const last = rows[rows.length - 1];

    pageCursor = { account_id: last.account_id, public_key: last.public_key };
    page += 1;

    logger.info(
      {
        genesisMissing,
        historic: historicRows.length,
        missing: missing.length,
        page,
        pageCursor,
        rows: rows.length,
      },
      'access key gap scan progress',
    );

    if (rows.length < config.reconcilePageSize) {
      break;
    }
  }

  if (genesisMissing) {
    logger.warn(
      { genesisMissing },
      'access keys missing from rebuild at genesis timestamp; processWindow cannot repair genesis-sourced rows, needs a manual genesis re-sync',
    );
  }

  return bandify(missing);
};

export const serializeGaps = (gaps: Gap[]) =>
  gaps.map((gap) => ({
    count: gap.count,
    fromTs: gap.fromTs.toString(),
    toTs: gap.toTs.toString(),
  }));

export const bandify = (timestamps: bigint[]): Gap[] => {
  if (!timestamps.length) {
    return [];
  }

  const sorted = [...timestamps].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const gaps: Gap[] = [];

  let fromTs = sorted[0];
  let toTs = sorted[0];
  let count = 1;

  for (let i = 1; i < sorted.length; i++) {
    const ts = sorted[i];

    if (ts - toTs > config.reconcileGapThresholdNs) {
      gaps.push({ count, fromTs, toTs });
      fromTs = ts;
      count = 0;
    }

    toTs = ts;
    count += 1;
  }

  gaps.push({ count, fromTs, toTs });

  return gaps;
};

export const repairGaps = async (
  gaps: Gap[],
  cursor: bigint,
): Promise<void> => {
  for (const gap of gaps) {
    const from = gap.fromTs - RECEIPT_EXECUTION_CAP_NS;
    const to = bigIntMin(gap.toTs + RECEIPT_EXECUTION_CAP_NS, cursor);

    logger.info(
      { count: gap.count, from: from.toString(), to: to.toString() },
      'repairing gap',
    );

    const { blockCount } = await processWindow(from, to);

    logger.info(
      { blockCount, from: from.toString(), to: to.toString() },
      'gap repaired',
    );
  }
};

export const reconcile = async (): Promise<void> => {
  const cursor = await getBackfillCursor();

  logger.info(
    { cursor: cursor.toString(), schema: groundTruth() },
    'scanning for rebuild gaps behind the backfill cursor...',
  );

  const accountGaps = await findAccountGaps(cursor);
  const keyGaps = await findAccessKeyGaps(cursor);

  logger.info(
    {
      accountGaps: serializeGaps(accountGaps),
      keyGaps: serializeGaps(keyGaps),
    },
    `gap scan complete: ${accountGaps.length} account gap(s), ${keyGaps.length} access key gap(s)`,
  );

  if (accountGaps.length) {
    logger.info('repairing account gaps...');
    await repairGaps(accountGaps, cursor);
  }

  if (keyGaps.length) {
    logger.info('repairing access key gaps...');
    await repairGaps(keyGaps, cursor);
  }

  if (!accountGaps.length && !keyGaps.length) {
    return;
  }

  logger.info('re-scanning to confirm...');

  const remainingAccountGaps = await findAccountGaps(cursor);
  const remainingKeyGaps = await findAccessKeyGaps(cursor);
  const remaining = remainingAccountGaps.length + remainingKeyGaps.length;

  if (remaining) {
    throw new Error(
      `${remaining} gap(s) remain after repair: ${JSON.stringify({
        remainingAccountGaps: serializeGaps(remainingAccountGaps),
        remainingKeyGaps: serializeGaps(remainingKeyGaps),
      })}`,
    );
  }

  logger.info('reconcile complete, no gaps remain');
};
