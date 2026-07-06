import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import knex, { baseKnex } from '#libs/knex';
import Sentry from '#libs/sentry';
import { big } from '#libs/utils';
import { IntentsSwap } from '#types/types';

const LIMIT = 60_000_000_000n; // 60s in ns
const OFFSET = 3_000_000_000n; // 3s in ns
// TEMP: index until (2025-01-01 00:00 UTC)
const END_TIMESTAMP = 1_735_689_600_000_000_000n;
const TABLE = 'mt_intents_swaps';
const CONTRACT = 'intents.near';
const INSERT_CHUNK_SIZE = 1000;

type OutcomeRow = {
  executed_in_block_timestamp: string;
  index_in_chunk: number;
  logs: string | string[];
  receipt_id: string;
  shard_id: number;
};

type TokenDiffLog = {
  account_id: string;
  diff: Record<string, string>;
  fees_collected?: Record<string, string>;
  referral?: string;
};

type TokenDiffEvent = {
  data: TokenDiffLog[];
  event: string;
  standard: string;
};

export const syncIntentsSwaps = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await swaps();
  }
};

const swaps = async () => {
  try {
    const [settings, tip] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      baseKnex
        .select('executed_in_block_timestamp')
        .from('execution_outcomes')
        .orderBy('executed_in_block_timestamp', 'desc')
        .limit(1)
        .first(),
    ]);

    const synced = big(settings?.value?.sync as string);
    const last = big(tip?.executed_in_block_timestamp);

    if (!last) {
      logger.warn(`${TABLE}: retrying... ${last}`);
      await sleep(600);

      return;
    }

    let end = last - OFFSET;
    const start = synced ? synced + 1n : BigInt(config.intentsStartTimestamp);

    // TEMP: index cap check
    if (start > END_TIMESTAMP) {
      logger.info(`${TABLE}: index cap reached, idling...`);
      await sleep(60_000);

      return;
    }
    if (end > END_TIMESTAMP) end = END_TIMESTAMP;
    // TEMP: index cap check

    if (end < start) {
      logger.warn(`${TABLE}: retrying... ${start} - ${end}`);
      await sleep(1000);

      return;
    }

    if (end - start > LIMIT) end = start + LIMIT;

    logger.info(`${TABLE}: blocks: ${start} - ${end}`);

    const outcomes = await baseKnex
      .select(
        'executed_in_block_timestamp',
        'shard_id',
        'index_in_chunk',
        'receipt_id',
        'logs',
      )
      .from('execution_outcomes')
      .where('executor_account_id', CONTRACT)
      .whereIn('status', ['SUCCESS_VALUE', 'SUCCESS_RECEIPT_ID'])
      .whereBetween('executed_in_block_timestamp', [
        start.toString(),
        end.toString(),
      ])
      .orderBy([
        { column: 'executed_in_block_timestamp', order: 'asc' },
        { column: 'shard_id', order: 'asc' },
        { column: 'index_in_chunk', order: 'asc' },
      ]);

    const events = parse(outcomes);

    await knex.transaction(async (trx) => {
      for (let i = 0; i < events.length; i += INSERT_CHUNK_SIZE) {
        await trx(TABLE)
          .insert(events.slice(i, i + INSERT_CHUNK_SIZE))
          .onConflict(['block_timestamp', 'shard_id', 'event_index'])
          .ignore();
      }

      await trx('settings')
        .insert({
          key: TABLE,
          value: { sync: end.toString() },
        })
        .onConflict('key')
        .merge();
    });
  } catch (error) {
    logger.error(error, 'syncIntentsSwaps');
    Sentry.captureException(error);
    await sleep(5000);
  }
};

export const parse = (outcomes: OutcomeRow[]): IntentsSwap[] => {
  const events: IntentsSwap[] = [];
  const indexes = new Map<string, number>();

  for (const outcome of outcomes) {
    const logs =
      typeof outcome.logs === 'string'
        ? (JSON.parse(outcome.logs) as string[])
        : outcome.logs ?? [];

    for (const log of logs) {
      const trimmed = log.trim();

      if (!trimmed.startsWith('EVENT_JSON:')) continue;

      const payload = trimmed.replace('EVENT_JSON:', '');
      let event: TokenDiffEvent;

      try {
        event = JSON.parse(payload) as TokenDiffEvent;
      } catch {
        // logs can be double-encoded: unescape once, then parse
        event = JSON.parse(
          JSON.parse(`"${payload}"`) as string,
        ) as TokenDiffEvent;
      }

      if (event.standard !== 'dip4' || event.event !== 'token_diff') continue;
      if (!Array.isArray(event.data)) continue;

      for (const item of event.data) {
        for (const token of Object.keys(item.diff).sort()) {
          const delta = BigInt(item.diff[token]);

          if (!delta) continue;

          const key = `${outcome.executed_in_block_timestamp}-${outcome.shard_id}`;
          const index = indexes.get(key) ?? 0;
          indexes.set(key, index + 1);

          events.push({
            account_id: item.account_id,
            block_timestamp: outcome.executed_in_block_timestamp,
            delta_amount: delta.toString(),
            event_index: index,
            fee_amount: item.fees_collected?.[token] ?? null,
            receipt_id: outcome.receipt_id,
            referral: item.referral ?? null,
            shard_id: outcome.shard_id,
            token_id: token,
          });
        }
      }
    }
  }

  return events;
};
