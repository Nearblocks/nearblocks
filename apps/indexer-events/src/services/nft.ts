import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import {
  EventCause,
  EventStandard,
  EventStatus,
  EventType,
  NFTEvent,
} from 'nb-types';
import { retry } from 'nb-utils';

import {
  isNFTBurnEventLog,
  isNFTMintEventLog,
  isNFTTransferEventLog,
} from '#libs/guards';
import { setEventIndex } from '#services/events';
import { EventDataEvent } from '#types/types';

export const storeNFTEvents = async (
  knex: Knex,
  shardId: number,
  blockHeader: types.BlockHeader,
  events: EventDataEvent[],
) => {
  const eventData: NFTEvent[] = [];

  events.forEach(({ data, event }) => {
    if (isNFTMintEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];

        if (eventItem.owner_id && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              eventData.push({
                affected_account_id: eventItem.owner_id,
                authorized_account_id: null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.MINT,
                contract_account_id: data.contractId,
                delta_amount: 1,
                event_index: '0',
                event_memo: eventItem.memo ?? null,
                involved_account_id: null,
                receipt_id: data.receiptId,
                standard: '',
                status: EventStatus.SUCCESS,
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

        if (eventItem.owner_id && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              eventData.push({
                affected_account_id: eventItem.owner_id,
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.BURN,
                contract_account_id: data.contractId,
                delta_amount: -1,
                event_index: '0',
                event_memo: eventItem.memo ?? null,
                involved_account_id: null,
                receipt_id: data.receiptId,
                standard: '',
                status: EventStatus.SUCCESS,
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

        if (eventItem.old_owner_id && eventItem.new_owner_id && tokens.length) {
          tokens
            .filter((token) => token)
            .forEach((token) => {
              eventData.push({
                affected_account_id: eventItem.old_owner_id,
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.TRANSFER,
                contract_account_id: data.contractId,
                delta_amount: -1,
                event_index: '0',
                event_memo: eventItem.memo ?? null,
                involved_account_id: eventItem.new_owner_id,
                receipt_id: data.receiptId,
                standard: '',
                status: EventStatus.SUCCESS,
                token_id: token,
              });
              eventData.push({
                affected_account_id: eventItem.new_owner_id,
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.TRANSFER,
                contract_account_id: data.contractId,
                delta_amount: 1,
                event_index: '0',
                event_memo: eventItem.memo ?? null,
                involved_account_id: eventItem.old_owner_id,
                receipt_id: data.receiptId,
                standard: '',
                status: EventStatus.SUCCESS,
                token_id: token,
              });
            });
        }
      });
    }
  });

  if (eventData.length) {
    const data = setEventIndex(
      shardId,
      blockHeader.timestamp,
      EventType.NEP171,
      EventStandard.NFT,
      eventData,
    );
    await saveNFTData(knex, data);
  }
};

export const saveNFTData = async (knex: Knex, data: NFTEvent[]) => {
  await retry(async () => {
    await knex('nft_events')
      .insert(data)
      .onConflict(['event_index', 'block_timestamp'])
      .ignore();
  });
};
