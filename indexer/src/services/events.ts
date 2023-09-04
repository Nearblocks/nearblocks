import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import log from '#libs/log';
import { EventDataEvent } from '#ts/types';
import { storeFTEvents } from '#services/ft';
import { storeNFTEvents } from '#services/nft';
import { isExecutionSuccess, jsonParse } from '#libs/utils';
import { matchContractEvents } from '#services/contracts/index';

// Unique sequential id for event types/contracts
// Insert new entries for new contracts
export enum EventType {
  NEP141 = 1,
  NEP171 = 2,
  WRAP_NEAR = 3,
  TKN_NEAR = 4,
  FACTORY_BRIDGE_NEAR = 5,
  AURORA = 6,
  TOKEN_A11BD_NEAR = 7,
  TOKEN_SKYWARD_NEAR = 8,
  META_POOL_NEAR = 9,
  META_TOKEN_NEAR = 10,
  TOKEN_BURROW_NEAR = 11,
  TOKEN_REF_FINANCE_NEAR = 12,
  TOKEN_V2_REF_FINANCE_NEAR = 13,
}

export const EVENT_PATTERN = {
  ACCOUNT: /^Account @([\S]+) burned (\d+)/,
  TRANSFER: /^Transfer (\d+) from ([\S]+) to ([\S]+)/,
  REFUND: /^Refund (\d+) from ([\S]+) to ([\S]+)/,
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
  const ftEvents: EventDataEvent[] = [];
  const nftEvents: EventDataEvent[] = [];

  message.shards.forEach((shard) => {
    shard.receiptExecutionOutcomes.forEach((outcome) => {
      if (
        outcome.receipt &&
        outcome.executionOutcome.outcome.logs &&
        isExecutionSuccess(outcome.executionOutcome.outcome.status)
      ) {
        const receipt = {
          receiptId: outcome.receipt.receiptId,
          blockTimestamp: message.block.header.timestampNanosec,
          shardId: shard.shardId,
          receiverId: outcome.receipt.receiverId,
          eventType: EventType.NEP141,
        };

        outcome.executionOutcome.outcome.logs.forEach((eventLog) => {
          try {
            const trimmed = eventLog.trim().startsWith(prefix)
              ? eventLog.trim().replace(prefix, '')
              : '';

            if (!trimmed) return;

            const event = jsonParse(trimmed);

            if (event.standard === 'nep141') {
              ftEvents.push({ receipt, event });
            }

            if (event.standard === 'nep171') {
              receipt.eventType = EventType.NEP171;
              nftEvents.push({ receipt, event });
            }
          } catch (error) {
            log.warn({ logs: outcome.executionOutcome.outcome.logs });
            log.warn(error);
          }
        });
      }
    });
  });

  await Promise.all([
    storeFTEvents(knex, ftEvents),
    storeNFTEvents(knex, nftEvents),
  ]);
};
