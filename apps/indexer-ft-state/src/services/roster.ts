import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import { Raw, Sample, VerificationRow, VerifyStatus } from '#types/types';

const ACCOUNT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789._-';
const SEED_IDLE_MS = 60 * 60 * 1000;
const DRAW_PAGE = 4;

const seen = new Set<string>();

export const noteContract = (db: Knex, contract: string): void => {
  if (seen.has(contract)) return;

  seen.add(contract);

  db('ft_state_verifications')
    .insert({ contract })
    .onConflict('contract')
    .ignore()
    .catch((error) => {
      logger.error(error, `noteContract: ${contract}`);
    });
};

const forget = (contract: string): void => {
  seen.delete(contract);
};

const walkContracts = async (
  db: Knex,
  cursor: string,
  limit: number,
): Promise<string[]> => {
  const { rows } = await db.raw<Raw<{ contract: string }>>(
    `
      WITH RECURSIVE walk AS (
        (SELECT contract FROM ft_state_holders WHERE contract > ? ORDER BY contract LIMIT 1)
        UNION ALL
        SELECT (
          SELECT h.contract FROM ft_state_holders h
          WHERE h.contract > walk.contract
          ORDER BY h.contract
          LIMIT 1
        )
        FROM walk
        WHERE walk.contract IS NOT NULL
      )
      SELECT contract FROM walk WHERE contract IS NOT NULL LIMIT ?
    `,
    [cursor, limit],
  );

  return rows.map((row) => row.contract);
};

const insertRoster = async (db: Knex, contracts: string[]): Promise<void> => {
  for (let i = 0; i < contracts.length; i += config.insertLimit) {
    await db('ft_state_verifications')
      .insert(
        contracts
          .slice(i, i + config.insertLimit)
          .map((contract) => ({ contract })),
      )
      .onConflict('contract')
      .ignore();
  }
};

export const syncRoster = async (db: Knex): Promise<void> => {
  for (;;) {
    try {
      const settings = await db('settings')
        .where('key', config.verifyKey)
        .first();
      const cursor = (settings?.value?.cursor as string | undefined) ?? '';

      const contracts = await walkContracts(db, cursor, config.verifySeedBatch);

      if (contracts.length) {
        await insertRoster(db, contracts);

        await db('settings')
          .insert({
            key: config.verifyKey,
            value: { cursor: contracts[contracts.length - 1] },
          })
          .onConflict('key')
          .merge();

        logger.info(
          `ft state audit: seeded ${contracts.length} contracts, cursor now ${
            contracts[contracts.length - 1]
          }`,
        );
      }

      if (contracts.length < config.verifySeedBatch) await sleep(SEED_IDLE_MS);
    } catch (error) {
      logger.error(error, 'ft state audit: seeder failed');
      await sleep(SEED_IDLE_MS);
    }
  }
};

export const claimNext = async (db: Knex): Promise<null | VerificationRow> => {
  const row = await db('ft_state_verifications')
    .whereNotIn('status', ['mismatch', 'absent'])
    .andWhere('attempts', '<', config.verifyMaxAttempts)
    .andWhere((builder) =>
      builder
        .whereNull('checked_at')
        .orWhere(
          'checked_at',
          '<',
          db.raw(`now() - (? * interval '1 day')`, [config.verifyCooldownDays]),
        ),
    )
    .orderByRaw('checked_at ASC NULLS FIRST')
    .limit(1)
    .first<VerificationRow>();

  return row ?? null;
};

const randomKey = (length = 3): string => {
  let key = '';

  for (let i = 0; i < length; i++) {
    key +=
      ACCOUNT_ALPHABET[Math.floor(Math.random() * ACCOUNT_ALPHABET.length)];
  }

  return key;
};

export const drawSamples = async (
  db: Knex,
  contract: string,
  maxHeight: number,
  count: number,
  exclude: Set<string>,
): Promise<Sample[]> => {
  const found = new Map<string, Sample>();

  const fetchFrom = async (bound: string) =>
    db<{
      account: string;
      amount: string;
      block_height: number;
    }>('ft_state_holders')
      .where('contract', contract)
      .andWhere('account', '>=', bound)
      .andWhere('block_height', '<=', maxHeight)
      .orderBy('account', 'asc')
      .limit(DRAW_PAGE)
      .select('account', 'amount', 'block_height');

  for (
    let attempt = 0;
    attempt < config.verifyDrawAttempts && found.size < count;
    attempt++
  ) {
    let rows = await fetchFrom(randomKey());
    if (!rows.length) rows = await fetchFrom('');

    for (const row of rows) {
      if (exclude.has(row.account) || found.has(row.account)) continue;

      found.set(row.account, {
        account: row.account,
        amount: BigInt(row.amount),
        blockHeight: Number(row.block_height),
      });
    }
  }

  const samples = [...found.values()];
  const nonZero = samples.filter((sample) => sample.amount > 0n);
  const zero = samples.filter((sample) => sample.amount === 0n);

  return (nonZero.length ? nonZero.concat(zero) : samples).slice(0, count);
};

export const recordVerdict = async (
  db: Knex,
  contract: string,
  update: {
    attempts: number;
    blockHeight: number;
    matched: number;
    mismatched: number;
    samples: number;
    status: VerifyStatus;
  },
): Promise<void> => {
  await db('ft_state_verifications')
    .where('contract', contract)
    .update({
      attempts: update.attempts,
      block_height: update.blockHeight,
      checked_at: db.fn.now(),
      checks: db.raw('checks + 1'),
      matched: update.matched,
      mismatched: update.mismatched,
      samples: update.samples,
      status: update.status,
    });
};

export const resetVerification = async (
  db: Knex,
  contract: string,
): Promise<void> => {
  forget(contract);

  await db('ft_state_verifications').where('contract', contract).update({
    attempts: 0,
    checked_at: null,
    status: 'pending',
  });
};
