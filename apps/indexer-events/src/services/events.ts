import { Knex } from 'nb-knex';
import { types } from 'nb-lake';
import { EventStandard, EventType, FTEvent, NFTEvent } from 'nb-types';

import { isNep141, isNep171 } from '#libs/guards';
import { isExecutionSuccess } from '#libs/utils';
import { storeFTEvents } from '#services/ft';
import { storeNFTEvents } from '#services/nft';
import { EventDataEvent, FTEventLogs, NFTEventLogs } from '#types/types';

import { matchLegacyFTEvents } from './contracts/ft/index.js';

export const EVENT_PATTERN = {
  ACCOUNT: /^Account @([\S]+) burned (\d+)/,
  AURORA_FINISH_DEPOSIT: /^Mint (\d+) nETH tokens for: ([\S]+)/,
  AURORA_REFUND: /^Refund amount (\d+) from ([\S]+) to ([\S]+)/,
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
    matchLegacyFTEvents(knex, message),
  ]);
};

export const storeNEPEvents = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
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
          const events = extractEvents(outcome);

          for (const event of events) {
            if (isNep141(event)) {
              ftEvents.push({ data, event });
            }

            if (isNep171(event)) {
              nftEvents.push({ data, event });
            }
          }
        }
      });

      await Promise.all([
        storeFTEvents(knex, shard.shardId, message.block.header, ftEvents),
        storeNFTEvents(knex, shard.shardId, message.block.header, nftEvents),
      ]);
    }),
  );
};

export const extractEvents = (outcome: types.ExecutionOutcomeWithReceipt) => {
  const prefix = 'EVENT_JSON:';
  const events: FTEventLogs[] | NFTEventLogs[] = [];

  for (const log of outcome.executionOutcome.outcome.logs) {
    const trimmed = log.trim().startsWith(prefix)
      ? log.trim().replace(prefix, '')
      : '';

    if (!trimmed) continue;

    try {
      events.push(JSON.parse(trimmed));
    } catch (error) {
      //
    }
  }

  return events;
};

export function setEventIndex(
  shardId: number,
  blockTimestamp: string,
  eventType: EventType,
  eventStandard: EventStandard,
  events: FTEvent[],
): FTEvent[];
export function setEventIndex(
  shardId: number,
  blockTimestamp: string,
  eventType: EventType,
  eventStandard: EventStandard,
  events: NFTEvent[],
): NFTEvent[];
export function setEventIndex(
  shardId: number,
  blockTimestamp: string,
  eventType: EventType,
  eventStandard: EventStandard,
  events: FTEvent[] | NFTEvent[],
): FTEvent[] | NFTEvent[] {
  const dataLength = events.length;
  const startIndex =
    BigInt(blockTimestamp) * 100_000_000n * 100_000_000n +
    BigInt(shardId) * 10_000_000n +
    BigInt(eventType) * 1_000_000n;

  for (let index = 0; index < dataLength; index++) {
    events[index].standard = eventStandard;
    events[index].event_index = String(startIndex + BigInt(index));
  }

  return events;
}
