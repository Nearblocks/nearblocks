import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { EventType, FTEvent, NFTEvent } from 'nb-types';

import { isNep141, isNep171 } from '#libs/guards';
import { isExecutionSuccess } from '#libs/utils';
import { storeFTEvents } from '#services/ft';
import { storeNFTEvents } from '#services/nft';
import { EventDataEvent } from '#types/types';

import { matchContractEvents } from './contracts/index.js';

export const EVENT_PATTERN = {
  ACCOUNT: /^Account @([\S]+) burned (\d+)/,
  REFUND: /^Refund (\d+) from ([\S]+) to ([\S]+)/,
  TRANSFER: /^Transfer (\d+) from ([\S]+) to ([\S]+)/,
  WRAP_NEAR_DEPOSIT: /^Deposit (\d+) NEAR to ([\S]+)/,
};

export const storeEvents = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all([
    storeNEPEvents(knex, message),
    matchContractEvents(knex, message),
  ]);
};

const storeNEPEvents = async (knex: Knex, message: types.StreamerMessage) => {
  const prefix = 'EVENT_JSON:';

  await Promise.all(
    message.shards.map(async (shard) => {
      const ftEvents: EventDataEvent[] = [];
      const nftEvents: EventDataEvent[] = [];

      shard.receiptExecutionOutcomes.forEach((outcome) => {
        if (
          outcome.receipt &&
          outcome.executionOutcome.outcome.logs &&
          isExecutionSuccess(outcome.executionOutcome.outcome.status)
        ) {
          const data = {
            blockHeight: message.block.header.height,
            blockTimestamp: message.block.header.timestampNanosec,
            contractId: outcome.executionOutcome.outcome.executorId,
            receiptId: outcome.receipt.receiptId,
            shardId: shard.shardId,
          };

          outcome.executionOutcome.outcome.logs.forEach((eventLog) => {
            try {
              const trimmed = eventLog.trim().startsWith(prefix)
                ? eventLog.trim().replace(prefix, '')
                : '';

              if (!trimmed) return;

              const event = JSON.parse(trimmed);

              if (isNep141(event)) {
                ftEvents.push({ data, event });
              }

              if (isNep171(event)) {
                nftEvents.push({ data, event });
              }
            } catch (error) {
              logger.warn({ logs: outcome.executionOutcome.outcome.logs });
              logger.warn(error);
            }
          });
        }
      });

      await Promise.all([
        storeFTEvents(knex, shard.shardId, message.block.header, ftEvents),
        storeNFTEvents(knex, shard.shardId, message.block.header, nftEvents),
      ]);
    }),
  );
};

export function setEventIndex(
  shardId: number,
  blockTimestamp: number,
  eventType: EventType,
  events: FTEvent[],
): FTEvent[];
export function setEventIndex(
  shardId: number,
  blockTimestamp: number,
  eventType: EventType,
  events: NFTEvent[],
): NFTEvent[];
export function setEventIndex(
  shardId: number,
  blockTimestamp: number,
  eventType: EventType,
  events: FTEvent[] | NFTEvent[],
): FTEvent[] | NFTEvent[] {
  const dataLength = events.length;
  const startIndex =
    BigInt(blockTimestamp) * 100_000_000n * 100_000_000n +
    BigInt(shardId) * 10_000_000n +
    BigInt(eventType) * 1_000_000n;

  for (let index = 0; index < dataLength; index++) {
    events[index].event_index = String(startIndex + BigInt(index));
  }

  return events;
}
