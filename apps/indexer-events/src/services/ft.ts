import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import {
  EventCause,
  EventStandard,
  EventStatus,
  EventType,
  FTEvent,
} from 'nb-types';
import { retry } from 'nb-utils';

import {
  isFTBurnEventLog,
  isFTMintEventLog,
  isFTTransferEventLog,
} from '#libs/guards';
import { decodeArgs } from '#libs/utils';
import { EVENT_PATTERN, setEventIndex } from '#services/events';
import {
  EventDataEvent,
  FTEventEntry,
  FTTransferArgs,
  FTTransferCallArgs,
} from '#types/types';

export const storeFTEvents = async (
  knex: Knex,
  shardId: number,
  blockHeader: types.BlockHeader,
  events: EventDataEvent[],
) => {
  const eventData: FTEvent[] = [];

  events.forEach(({ data, event }) => {
    if (isFTMintEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        if (eventItem.owner_id && BigInt(eventItem.amount)) {
          eventData.push({
            absolute_amount: '0',
            affected_account_id: eventItem.owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.MINT,
            contract_account_id: data.contractId,
            delta_amount: eventItem.amount,
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: null,
            receipt_id: data.receiptId,
            standard: EventStandard.FT,
            status: EventStatus.SUCCESS,
          });
        }
      });
    }

    if (isFTBurnEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const amount = BigInt(eventItem.amount);

        if (eventItem.owner_id && amount) {
          eventData.push({
            absolute_amount: '0',
            affected_account_id: eventItem.owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.MINT,
            contract_account_id: data.contractId,
            delta_amount: String(amount * -1n),
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: null,
            receipt_id: data.receiptId,
            standard: EventStandard.FT,
            status: EventStatus.SUCCESS,
          });
        }
      });
    }

    if (isFTTransferEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const amount = BigInt(eventItem.amount);

        if (eventItem.old_owner_id && eventItem.new_owner_id && amount) {
          eventData.push({
            absolute_amount: '0',
            affected_account_id: eventItem.old_owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.MINT,
            contract_account_id: data.contractId,
            delta_amount: String(amount * -1n),
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: eventItem.new_owner_id,
            receipt_id: data.receiptId,
            standard: EventStandard.FT,
            status: EventStatus.SUCCESS,
          });
          eventData.push({
            absolute_amount: '0',
            affected_account_id: eventItem.new_owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.MINT,
            contract_account_id: data.contractId,
            delta_amount: eventItem.amount,
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: eventItem.old_owner_id,
            receipt_id: data.receiptId,
            standard: EventStandard.FT,
            status: EventStatus.SUCCESS,
          });
        }
      });
    }
  });

  if (eventData.length) {
    const data = setEventIndex(
      shardId,
      blockHeader.timestamp,
      EventType.NEP141,
      eventData,
    );
    await saveFTData(knex, data);
  }
};

export const saveFTData = async (knex: Knex, data: FTEvent[]) => {
  await retry(async () => {
    await knex('ft_events')
      .insert(data)
      .onConflict(['event_index', 'block_timestamp'])
      .ignore();
  });
};

export const ftTransfer = (
  args: string,
  predecessor: string,
): FTEventEntry[] => {
  const decodedArgs = decodeArgs<FTTransferArgs>(args);
  const amount = BigInt(decodedArgs.amount);

  if (decodedArgs.receiver_id && amount) {
    return [
      {
        affected: predecessor,
        amount: String(amount * -1n),
        cause: EventCause.TRANSFER,
        involved: decodedArgs.receiver_id,
        memo: decodedArgs.memo ?? null,
      },
      {
        affected: decodedArgs.receiver_id,
        amount: decodedArgs.amount,
        cause: EventCause.TRANSFER,
        involved: predecessor,
        memo: decodedArgs.memo ?? null,
      },
    ];
  }

  return [];
};

export const ftTransferCall = (
  args: string,
  predecessor: string,
): FTEventEntry[] => {
  const decodedArgs = decodeArgs<FTTransferCallArgs>(args);
  const amount = BigInt(decodedArgs.amount);

  if (decodedArgs.receiver_id && amount) {
    return [
      {
        affected: predecessor,
        amount: String(amount * -1n),
        cause: EventCause.TRANSFER,
        involved: decodedArgs.receiver_id,
        memo: decodedArgs.memo ?? null,
      },
      {
        affected: decodedArgs.receiver_id,
        amount: decodedArgs.amount,
        cause: EventCause.TRANSFER,
        involved: predecessor,
        memo: decodedArgs.memo ?? null,
      },
    ];
  }

  return [];
};

export const ftResolveTransfer = (logs: string[]): FTEventEntry[] => {
  if (!logs.length) return [];

  const eventItems: FTEventEntry[] = [];

  logs.forEach((log) => {
    if (EVENT_PATTERN.ACCOUNT.test(log)) {
      const match = log.match(EVENT_PATTERN.ACCOUNT);

      if (match?.length === 3 && match[1] && BigInt(match[2])) {
        eventItems.push({
          affected: match[1],
          amount: match[2],
          cause: EventCause.BURN,
          involved: null,
          memo: null,
        });
      }
    }

    if (EVENT_PATTERN.REFUND.test(log)) {
      const match = log.match(EVENT_PATTERN.REFUND);

      if (match?.length === 4 && match[2] && match[3] && BigInt(match[1])) {
        eventItems.push({
          affected: match[2],
          amount: String(BigInt(match[1]) * -1n),
          cause: EventCause.TRANSFER,
          involved: match[3],
          memo: null,
        });
        eventItems.push({
          affected: match[3],
          amount: match[1],
          cause: EventCause.TRANSFER,
          involved: match[2],
          memo: null,
        });
      }
    }
  });

  return eventItems;
};
