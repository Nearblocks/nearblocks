import { BlockHeader } from 'nb-blocks-minio';
import { Knex } from 'nb-knex';
import { EventCause, EventStandard, MTEvent } from 'nb-types';
import { retry } from 'nb-utils';

import {
  isMTBurnEventLog,
  isMTMintEventLog,
  isMTTransferEventLog,
} from '#libs/guards';
import { updateMTEvents } from '#services/events';
import { EventDataEvent } from '#types/types';

export const storeMTEvents = async (
  knex: Knex,
  shardId: number,
  blockHeader: BlockHeader,
  events: EventDataEvent[],
) => {
  const eventData: MTEvent[] = [];

  events.forEach(({ data, event }) => {
    if (isMTMintEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];
        const amounts = Array.isArray(eventItem.amounts)
          ? eventItem.amounts
          : [];

        if (tokens.length !== amounts.length) return;

        const mints = tokens.map((token, index) => ({
          amount: amounts[index],
          token,
        }));

        if (
          typeof eventItem.owner_id === 'string' &&
          eventItem.owner_id.trim() &&
          mints.length
        ) {
          mints.forEach((mint) => {
            if (mint.token && +mint.amount) {
              eventData.push({
                affected_account_id: eventItem.owner_id.trim(),
                authorized_account_id: null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.MINT,
                contract_account_id: data.contractId,
                delta_amount: mint.amount,
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: null,
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: mint.token,
              });
            }
          });
        }
      });
    }

    if (isMTBurnEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];
        const amounts = Array.isArray(eventItem.amounts)
          ? eventItem.amounts
          : [];

        if (tokens.length !== amounts.length) return;

        const burns = tokens.map((token, index) => ({
          amount: amounts[index],
          token,
        }));

        if (
          typeof eventItem.owner_id === 'string' &&
          eventItem.owner_id.trim() &&
          burns.length
        ) {
          burns.forEach((burn) => {
            if (burn.token && +burn.amount) {
              const deltaAmount = BigInt(burn.amount) * -1n;

              eventData.push({
                affected_account_id: eventItem.owner_id.trim(),
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.BURN,
                contract_account_id: data.contractId,
                delta_amount: String(deltaAmount),
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: null,
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: burn.token,
              });
            }
          });
        }
      });
    }

    if (isMTTransferEventLog(event) && Array.isArray(event.data)) {
      event.data.forEach((eventItem) => {
        const tokens = Array.isArray(eventItem.token_ids)
          ? eventItem.token_ids
          : [];
        const amounts = Array.isArray(eventItem.amounts)
          ? eventItem.amounts
          : [];

        if (tokens.length !== amounts.length) return;

        const transfers = tokens.map((token, index) => ({
          amount: amounts[index],
          token,
        }));

        if (
          typeof eventItem.old_owner_id === 'string' &&
          eventItem.old_owner_id.trim() &&
          typeof eventItem.new_owner_id === 'string' &&
          eventItem.new_owner_id.trim() &&
          transfers.length
        ) {
          transfers.forEach((transfer) => {
            if (transfer.token && +transfer.amount) {
              const deltaAmount = BigInt(transfer.amount);
              const negativeDeltaAmount = deltaAmount * -1n;

              eventData.push({
                affected_account_id: eventItem.old_owner_id.trim(),
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.TRANSFER,
                contract_account_id: data.contractId,
                delta_amount: String(negativeDeltaAmount),
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: eventItem.new_owner_id.trim(),
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: transfer.token,
              });
              eventData.push({
                affected_account_id: eventItem.new_owner_id.trim(),
                authorized_account_id: eventItem.authorized_id ?? null,
                block_height: blockHeader.height,
                block_timestamp: blockHeader.timestampNanosec,
                cause: EventCause.TRANSFER,
                contract_account_id: data.contractId,
                delta_amount: String(deltaAmount),
                event_index: 0, // will be set later
                event_memo: eventItem.memo ?? null,
                involved_account_id: eventItem.old_owner_id.trim(),
                receipt_id: data.receiptId,
                shard_id: 0, // will be set later
                standard: '', // will be set later
                token_id: transfer.token,
              });
            }
          });
        }
      });
    }
  });

  if (eventData.length) {
    const data = updateMTEvents(shardId, EventStandard.MT, eventData);
    await saveMTData(knex, data);
  }
};

export const saveMTData = async (knex: Knex, data: MTEvent[]) => {
  await retry(async () => {
    await knex('mt_events')
      .insert(data)
      .onConflict(['block_timestamp', 'shard_id', 'event_index'])
      .ignore();
  });
};
