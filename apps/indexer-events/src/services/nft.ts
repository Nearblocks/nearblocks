import { BlockHeader } from 'nb-blocks';
import { Knex } from 'nb-knex';
import { EventCause, EventStandard, NFTEvent } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isNFTBurnEventLog,
  isNFTMintEventLog,
  isNFTTransferEventLog,
} from '#libs/guards';
import { updateNFTEvents } from '#services/events';
import { EventDataEvent } from '#types/types';

export const storeNFTEvents = async (
  knex: Knex,
  shardId: number,
  blockHeader: BlockHeader,
  events: EventDataEvent[],
) => {
  const eventData: NFTEvent[] = [];

  events.forEach(({ data, event }) => {
    if (isNFTMintEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (eventItem.owner_id && eventItem.owner_id.trim() && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              eventData.push({
                affected_account_id: eventItem.owner_id.trim(),
                authorized_account_id: null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.MINT,
                contract_account_id: data.contractId,
                delta_amount: 1,
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: null,
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: token,
              });
            });
        }
      });
    }

    if (isNFTBurnEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (eventItem.owner_id && eventItem.owner_id.trim() && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              eventData.push({
                affected_account_id: eventItem.owner_id.trim(),
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.BURN,
                contract_account_id: data.contractId,
                delta_amount: -1,
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: null,
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: token,
              });
            });
        }
      });
    }

    if (isNFTTransferEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (
          eventItem.old_owner_id &&
          eventItem.old_owner_id.trim() &&
          eventItem.new_owner_id &&
          eventItem.new_owner_id.trim() &&
          tokens.length
        ) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              eventData.push({
                affected_account_id: eventItem.old_owner_id.trim(),
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.TRANSFER,
                contract_account_id: data.contractId,
                delta_amount: -1,
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: eventItem.new_owner_id.trim(),
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: token,
              });
              eventData.push({
                affected_account_id: eventItem.new_owner_id.trim(),
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.TRANSFER,
                contract_account_id: data.contractId,
                delta_amount: 1,
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: eventItem.old_owner_id.trim(),
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: token,
              });
            });
        }
      });
    }
  });

  if (eventData.length) {
    const data = updateNFTEvents(shardId, EventStandard.NFT, eventData);
    await saveNFTData(knex, data);
  }
};

export const saveNFTData = async (knex: Knex, data: NFTEvent[]) => {
  await retry(async () => {
    await knex('nft_events')
      .insert(data)
      .onConflict(['block_timestamp', 'shard_id', 'event_index'])
      .ignore();
  });
};
