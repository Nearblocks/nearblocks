import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import config from '#config';
import { db, tbl } from '#libs/knex';
import { processWindow, RECEIPT_EXECUTION_CAP_NS } from '#services/backfill';

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

export const findAccountGaps = async (): Promise<Gap[]> => {
  const missing: bigint[] = [];
  let cursor: null | string = null;
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
        { cursor, pageSize: config.reconcilePageSize },
      );

      return result.rows;
    });

    if (!rows.length) {
      break;
    }

    const ids = rows.map((row) => row.account_id);
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

    for (const row of rows) {
      if (!existingIds.has(row.account_id)) {
        missing.push(BigInt(row.created_by_block_timestamp));
      }
    }

    cursor = ids[ids.length - 1];
    page += 1;

    logger.info(
      { cursor, missing: missing.length, page, rows: rows.length },
      'account gap scan progress',
    );

    if (rows.length < config.reconcilePageSize) {
      break;
    }
  }

  return bandify(missing);
};

export const findAccessKeyGaps = async (): Promise<Gap[]> => {
  const missing: bigint[] = [];
  let cursor: { account_id: string; public_key: string } | null = null;
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
          cursorAccount: cursor?.account_id ?? null,
          cursorKey: cursor?.public_key ?? null,
          pageSize: config.reconcilePageSize,
        },
      );

      return result.rows;
    });

    if (!rows.length) {
      break;
    }

    const existing: { account_id: string; public_key: string }[] = await retry(
      async () => {
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
            accountIds: rows.map((row) => row.account_id),
            publicKeys: rows.map((row) => row.public_key),
          },
        );

        return result.rows;
      },
    );
    const existingKeys = new Set(
      existing.map((row) => `${row.public_key}:${row.account_id}`),
    );

    for (const row of rows) {
      if (!existingKeys.has(`${row.public_key}:${row.account_id}`)) {
        missing.push(BigInt(row.created_by_block_timestamp));
      }
    }

    const last = rows[rows.length - 1];

    cursor = { account_id: last.account_id, public_key: last.public_key };
    page += 1;

    logger.info(
      { cursor, missing: missing.length, page, rows: rows.length },
      'access key gap scan progress',
    );

    if (rows.length < config.reconcilePageSize) {
      break;
    }
  }

  return bandify(missing);
};

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

export const repairGaps = async (gaps: Gap[]): Promise<void> => {
  for (const gap of gaps) {
    const from = gap.fromTs - RECEIPT_EXECUTION_CAP_NS;
    const to = gap.toTs + RECEIPT_EXECUTION_CAP_NS;

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
  logger.info({ schema: groundTruth() }, 'scanning for rebuild gaps...');

  const accountGaps = await findAccountGaps();
  const keyGaps = await findAccessKeyGaps();

  logger.info(
    { accountGaps, keyGaps },
    `gap scan complete: ${accountGaps.length} account gap(s), ${keyGaps.length} access key gap(s)`,
  );

  if (accountGaps.length) {
    logger.info('repairing account gaps...');
    await repairGaps(accountGaps);
  }

  if (keyGaps.length) {
    logger.info('repairing access key gaps...');
    await repairGaps(keyGaps);
  }

  if (!accountGaps.length && !keyGaps.length) {
    return;
  }

  logger.info('re-scanning to confirm...');

  const remainingAccountGaps = await findAccountGaps();
  const remainingKeyGaps = await findAccessKeyGaps();
  const remaining = remainingAccountGaps.length + remainingKeyGaps.length;

  if (remaining) {
    throw new Error(
      `${remaining} gap(s) remain after repair: ${JSON.stringify({
        remainingAccountGaps,
        remainingKeyGaps,
      })}`,
    );
  }

  logger.info('reconcile complete, no gaps remain');
};
