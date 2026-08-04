import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import config from '#config';
import { db, dbBase } from '#libs/knex';
import { deriveKey, getRootKeys, MPC_CONTRACT } from '#libs/mpc';
import { resolveMpcDomainId } from '#services/signature';
import { SignRequest } from '#types/types';

const indexerKey = 'signature-mpc-backfill';
const batchSize = config.insertLimit;
const signer = MPC_CONTRACT[config.network];

type BackfillRow = {
  receipt_included_in_block_timestamp: string;
  receipt_predecessor_account_id: string;
  request: null | SignRequest;
};

type DerivedKeyRow = {
  account_id: string;
  block_timestamp: string;
  domain_id: number;
  path: string;
  public_key: string;
};

const bigIntMin = (a: bigint, b: bigint): bigint => (a < b ? a : b);

export const backfillMpcKeys = async (): Promise<void> => {
  const settings = await db('settings').where({ key: indexerKey }).first();
  const end = BigInt(config.signerEndTimestamp);
  let from = BigInt(
    String(settings?.value?.backfillTimestamp ?? config.signerStartTimestamp),
  );

  logger.info(`backfilling mpc keys from timestamp: ${from} to: ${end}`);

  let totalScanned = 0;
  let totalInserted = 0;

  while (from < end) {
    const to = bigIntMin(from + config.backfillWindowSize, end);
    const rows = await retry(async () => fetchWindow(from, to));
    const inserted = await storeDerivedKeys(rows);

    totalScanned += rows.length;
    totalInserted += inserted;

    await db('settings')
      .insert({
        key: indexerKey,
        value: { backfillTimestamp: to.toString() },
      })
      .onConflict('key')
      .merge();

    logger.info(
      `window ${from}-${to}: ${rows.length} sign calls scanned, ${inserted} keys derived`,
    );

    from = to;
  }

  logger.info(
    `backfill complete: ${totalScanned} sign calls scanned, ${totalInserted} keys derived`,
  );
};

const fetchWindow = async (
  from: bigint,
  to: bigint,
): Promise<BackfillRow[]> => {
  const result = await dbBase.raw(
    `
      SELECT
        receipt_predecessor_account_id,
        receipt_included_in_block_timestamp,
        args -> 'args_json' -> 'request' AS request
      FROM action_receipt_actions
      WHERE receipt_included_in_block_timestamp >= :from::BIGINT
        AND receipt_included_in_block_timestamp <  :to::BIGINT
        AND method = 'sign'
        AND receipt_receiver_account_id = :signer::TEXT
        AND args -> 'args_json' -> 'request' IS NOT NULL
    `,
    { from: from.toString(), signer, to: to.toString() },
  );

  return result.rows;
};

const storeDerivedKeys = async (rows: BackfillRow[]): Promise<number> => {
  if (!rows.length) return 0;

  const roots = getRootKeys();
  const dedupedByPublicKey = new Map<string, DerivedKeyRow>();

  for (const row of rows) {
    const domainId = resolveMpcDomainId(row.request ?? undefined);

    if (domainId === null) continue;

    const path = row.request?.path ?? '';
    const publicKey = deriveKey(
      domainId,
      roots,
      row.receipt_predecessor_account_id,
      path,
    );

    if (!dedupedByPublicKey.has(publicKey)) {
      dedupedByPublicKey.set(publicKey, {
        account_id: row.receipt_predecessor_account_id,
        block_timestamp: row.receipt_included_in_block_timestamp,
        domain_id: domainId,
        path,
        public_key: publicKey,
      });
    }
  }

  const derivedKeys = [...dedupedByPublicKey.values()];

  for (let i = 0; i < derivedKeys.length; i += batchSize) {
    const batch = derivedKeys.slice(i, i + batchSize);

    await retry(async () => {
      await dbBase('mpc_derived_keys')
        .insert(batch)
        .onConflict('public_key')
        .ignore();
    });
  }

  return derivedKeys.length;
};
