import { ExecutionOutcomeWithReceipt, Message } from 'nb-blocks-minio';
import { Knex } from 'nb-knex';
import { EventStandard, EventType, FTEvent, MTEvent, NFTEvent } from 'nb-types';

import { isNep141, isNep171, isNep245 } from '#libs/guards';
import { isExecutionSuccess } from '#libs/utils';
import { matchLegacyFTEvents } from '#services/contracts/ft/index';
import { storeFTEvents } from '#services/ft';
import { storeMTEvents } from '#services/mt';
import { storeNFTEvents } from '#services/nft';
import { EventDataEvent, FTEventLogs, NFTEventLogs } from '#types/types';

export const EVENT_PATTERN = {
  ACCOUNT: /^Account @([\S]+) burned (\d+)/,
  AURORA_FINISH_DEPOSIT: /^Mint (\d+) nETH tokens for: ([\S]+)/,
  AURORA_REFUND: /^Refund amount (\d+) from ([\S]+) to ([\S]+)/,
  REFUND: /^Refund (\d+) from ([\S]+) to ([\S]+)/,
  TRANSFER: /^Transfer (\d+) from ([\S]+) to ([\S]+)/,
  WRAP_NEAR_DEPOSIT: /^Deposit (\d+) NEAR to ([\S]+)/,
};

export const storeEvents = async (knex: Knex, message: Message) => {
  await Promise.all([
    storeNEPEvents(knex, message),
    matchLegacyFTEvents(knex, message),
  ]);
};

export const storeNEPEvents = async (knex: Knex, message: Message) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      const ftEvents: EventDataEvent[] = [];
      const nftEvents: EventDataEvent[] = [];
      const mtEvents: EventDataEvent[] = [];

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

            if (isNep245(event)) {
              mtEvents.push({ data, event });
            }
          }
        }
      });

      await Promise.all([
        storeFTEvents(knex, shard.shardId, message.block.header, ftEvents),
        storeNFTEvents(knex, shard.shardId, message.block.header, nftEvents),
        storeMTEvents(knex, shard.shardId, message.block.header, mtEvents),
      ]);
    }),
  );
};

export const extractEvents = (outcome: ExecutionOutcomeWithReceipt) => {
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

export function updateFTEvents(
  shardId: number,
  eventType: EventType,
  eventStandard: EventStandard,
  events: FTEvent[],
): FTEvent[] {
  const dataLength = events.length;

  for (let index = 0; index < dataLength; index++) {
    events[index].shard_id = shardId;
    events[index].event_type = eventType;
    events[index].event_index = index;
    events[index].standard = eventStandard;
  }

  return events;
}

export function updateNFTEvents(
  shardId: number,
  eventStandard: EventStandard,
  events: NFTEvent[],
): NFTEvent[] {
  const dataLength = events.length;

  for (let index = 0; index < dataLength; index++) {
    events[index].shard_id = shardId;
    events[index].event_index = index;
    events[index].standard = eventStandard;
  }

  return events;
}

export function updateMTEvents(
  shardId: number,
  eventStandard: EventStandard,
  events: MTEvent[],
): MTEvent[] {
  const dataLength = events.length;

  for (let index = 0; index < dataLength; index++) {
    events[index].shard_id = shardId;
    events[index].event_index = index;
    events[index].standard = eventStandard;
  }

  return events;
}
