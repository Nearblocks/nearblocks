import { Knex } from 'knex';

import retry from '#libs/retry';
import { FtEventKind } from '#ts/enums';
import { decodeArgs } from '#libs/utils';
import { EVENT_PATTERN } from '#services/events';
import {
  isFtBurnEventLog,
  isFtMintEventLog,
  isFtTransferEventLog,
} from '#libs/guards';
import {
  FtEventEntry,
  EventDataEvent,
  FtTransferArgs,
  EventReceiptData,
  FtTransferCallArgs,
  AssetsFungibleTokenEvent,
} from '#ts/types';

export const storeFTEvents = async (knex: Knex, events: EventDataEvent[]) => {
  const data: AssetsFungibleTokenEvent[] = [];

  events.forEach(({ receipt, event }) => {
    if (isFtMintEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        if (eventItem.owner_id && eventItem.amount) {
          data.push(
            getFTData(receipt, data.length, {
              kind: FtEventKind.MINT,
              amount: eventItem.amount,
              from: '',
              to: eventItem.owner_id,
              memo: eventItem.memo || '',
            }),
          );
        }
      });
    }

    if (isFtBurnEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        if (eventItem.owner_id && eventItem.amount) {
          data.push(
            getFTData(receipt, data.length, {
              kind: FtEventKind.BURN,
              amount: eventItem.amount,
              from: eventItem.owner_id,
              to: '',
              memo: eventItem.memo || '',
            }),
          );
        }
      });
    }

    if (isFtTransferEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        if (
          eventItem.old_owner_id &&
          eventItem.new_owner_id &&
          eventItem.amount
        ) {
          data.push(
            getFTData(receipt, data.length, {
              kind: FtEventKind.TRANSFER,
              amount: eventItem.amount,
              from: eventItem.old_owner_id,
              to: eventItem.new_owner_id,
              memo: eventItem.memo || '',
            }),
          );
        }
      });
    }
  });

  if (data.length) {
    await saveFTData(knex, data);
  }
};

export const getFTData = (
  receipt: EventReceiptData,
  eventIndex: number,
  event: FtEventEntry,
): AssetsFungibleTokenEvent => ({
  emitted_for_receipt_id: receipt.receiptId,
  emitted_at_block_timestamp: receipt.blockTimestamp,
  emitted_in_shard_id: receipt.shardId,
  emitted_for_event_type: receipt.eventType,
  emitted_index_of_event_entry_in_shard: eventIndex,
  emitted_by_contract_account_id: receipt.receiverId,
  amount: event.amount,
  event_kind: event.kind,
  token_old_owner_account_id: event.from,
  token_new_owner_account_id: event.to,
  event_memo: event.memo,
});

export const saveFTData = async (
  knex: Knex,
  data: AssetsFungibleTokenEvent | AssetsFungibleTokenEvent[],
) => {
  await retry(async () => {
    await knex('assets__fungible_token_events')
      .insert(data)
      .onConflict([
        'emitted_for_receipt_id',
        'emitted_at_block_timestamp',
        'emitted_in_shard_id',
        'emitted_for_event_type',
        'emitted_index_of_event_entry_in_shard',
      ])
      .ignore();
  });
};

export const ftTransfer = (
  args: string,
  predecessor: string,
): FtEventEntry[] => {
  const decodedArgs = decodeArgs<FtTransferArgs>(args);

  return [
    {
      kind: FtEventKind.TRANSFER,
      amount: decodedArgs.amount,
      from: predecessor,
      to: decodedArgs.receiver_id,
      memo: decodedArgs.memo || '',
    },
  ];
};

export const ftTransferCall = (
  args: string,
  predecessor: string,
): FtEventEntry[] => {
  const decodedArgs = decodeArgs<FtTransferCallArgs>(args);

  return [
    {
      kind: FtEventKind.TRANSFER,
      amount: decodedArgs.amount,
      from: predecessor,
      to: decodedArgs.receiver_id,
      memo: decodedArgs.memo || '',
    },
  ];
};

export const ftResolveTransfer = (logs: string[]): FtEventEntry[] => {
  if (!logs.length) return [];

  const eventItems: FtEventEntry[] = [];

  logs.forEach((log) => {
    if (EVENT_PATTERN.ACCOUNT.test(log)) {
      const match = log.match(EVENT_PATTERN.ACCOUNT);

      if (match?.length === 3) {
        eventItems.push({
          kind: FtEventKind.BURN,
          amount: match[2],
          from: match[1],
          to: '',
          memo: '',
        });
      }
    }

    if (EVENT_PATTERN.REFUND.test(log)) {
      const match = log.match(EVENT_PATTERN.REFUND);

      if (match?.length === 4) {
        eventItems.push({
          kind: FtEventKind.TRANSFER,
          amount: match[1],
          from: match[2],
          to: match[3],
          memo: '',
        });
      }
    }
  });

  return eventItems;
};
