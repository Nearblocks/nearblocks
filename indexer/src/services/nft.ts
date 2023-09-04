import { Knex } from 'knex';

import retry from '#libs/retry';
import { NftEventKind } from '#ts/enums';
import {
  isNftBurnEventLog,
  isNftMintEventLog,
  isNftTransferEventLog,
} from '#libs/guards';
import {
  NftEventEntry,
  EventDataEvent,
  EventReceiptData,
  AssetsNonFungibleTokenEvent,
} from '#ts/types';

export const storeNFTEvents = async (knex: Knex, events: EventDataEvent[]) => {
  const data: AssetsNonFungibleTokenEvent[] = [];

  events.forEach(({ receipt, event }) => {
    if (isNftMintEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (eventItem.owner_id && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              data.push(
                getNFTData(receipt, data.length, {
                  kind: NftEventKind.MINT,
                  token,
                  from: '',
                  to: eventItem.owner_id,
                  author: '',
                  memo: eventItem.memo || '',
                }),
              );
            });
        }
      });
    }

    if (isNftBurnEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (eventItem.owner_id && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              data.push(
                getNFTData(receipt, data.length, {
                  kind: NftEventKind.BURN,
                  token,
                  from: eventItem.owner_id,
                  to: '',
                  author: eventItem.authorized_id || '',
                  memo: eventItem.memo || '',
                }),
              );
            });
        }
      });
    }

    if (isNftTransferEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (eventItem.old_owner_id && eventItem.new_owner_id && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              data.push(
                getNFTData(receipt, data.length, {
                  kind: NftEventKind.TRANSFER,
                  token,
                  from: eventItem.old_owner_id,
                  to: eventItem.new_owner_id,
                  author: eventItem.authorized_id || '',
                  memo: eventItem.memo || '',
                }),
              );
            });
        }
      });
    }
  });

  if (data.length) {
    await saveNFTData(knex, data);
  }
};

export const getNFTData = (
  receipt: EventReceiptData,
  eventIndex: number,
  event: NftEventEntry,
): AssetsNonFungibleTokenEvent => ({
  emitted_for_receipt_id: receipt.receiptId,
  emitted_at_block_timestamp: receipt.blockTimestamp,
  emitted_in_shard_id: receipt.shardId,
  emitted_for_event_type: receipt.eventType,
  emitted_index_of_event_entry_in_shard: eventIndex,
  emitted_by_contract_account_id: receipt.receiverId,
  token_id: event.token,
  event_kind: event.kind,
  token_old_owner_account_id: event.from,
  token_new_owner_account_id: event.to,
  token_authorized_account_id: event.author,
  event_memo: event.memo,
});

export const saveNFTData = async (
  knex: Knex,
  data: AssetsNonFungibleTokenEvent | AssetsNonFungibleTokenEvent[],
) => {
  await retry(async () => {
    await knex('assets__non_fungible_token_events')
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
