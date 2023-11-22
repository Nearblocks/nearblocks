import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
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
  isFunctionCallAction,
} from '#libs/guards';
import { decodeArgs, isExecutionSuccess } from '#libs/utils';
import { EVENT_PATTERN, extractEvents, setEventIndex } from '#services/events';
import {
  EventDataEvent,
  FTContractMatchAction,
  FTEventEntry,
  FTTransferArgs,
} from '#types/types';

export const storeFTEvents = async (
  knex: Knex,
  shardId: number,
  blockHeader: types.BlockHeader,
  events: EventDataEvent[],
) => {
  let eventData: FTEvent[] = [];

  for (const { data, event } of events) {
    if (isFTMintEventLog(event) && Array.isArray(event.data)) {
      for (const eventItem of event.data) {
        const deltaAmount = BigInt(eventItem.amount);

        if (eventItem.owner_id && deltaAmount) {
          eventData.push({
            absolute_amount: null,
            affected_account_id: eventItem.owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.MINT,
            contract_account_id: data.contractId,
            delta_amount: String(deltaAmount),
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: null,
            receipt_id: data.receiptId,
            standard: '',
            status: EventStatus.SUCCESS,
          });
        }
      }
    }

    if (isFTBurnEventLog(event) && Array.isArray(event.data)) {
      for (const eventItem of event.data) {
        const deltaAmount = BigInt(eventItem.amount) * -1n;

        if (eventItem.owner_id && deltaAmount) {
          eventData.push({
            absolute_amount: null,
            affected_account_id: eventItem.owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.BURN,
            contract_account_id: data.contractId,
            delta_amount: String(deltaAmount),
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: null,
            receipt_id: data.receiptId,
            standard: '',
            status: EventStatus.SUCCESS,
          });
        }
      }
    }

    if (isFTTransferEventLog(event) && Array.isArray(event.data)) {
      for (const eventItem of event.data) {
        const deltaAmount = BigInt(eventItem.amount);
        const negativeDeltaAmount = deltaAmount * -1n;

        if (eventItem.old_owner_id && eventItem.new_owner_id && deltaAmount) {
          eventData.push({
            absolute_amount: null,
            affected_account_id: eventItem.old_owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.TRANSFER,
            contract_account_id: data.contractId,
            delta_amount: String(negativeDeltaAmount),
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: eventItem.new_owner_id,
            receipt_id: data.receiptId,
            standard: '',
            status: EventStatus.SUCCESS,
          });
          eventData.push({
            absolute_amount: null,
            affected_account_id: eventItem.new_owner_id,
            block_height: blockHeader.height,
            block_timestamp: blockHeader.timestampNanosec,
            cause: EventCause.TRANSFER,
            contract_account_id: data.contractId,
            delta_amount: String(deltaAmount),
            event_index: '0',
            event_memo: eventItem.memo ?? null,
            involved_account_id: eventItem.old_owner_id,
            receipt_id: data.receiptId,
            standard: '',
            status: EventStatus.SUCCESS,
          });
        }
      }
    }
  }

  if (eventData.length) {
    eventData = setEventIndex(
      shardId,
      blockHeader.timestamp,
      EventType.NEP141,
      EventStandard.FT,
      eventData,
    );

    await saveFTData(knex, eventData);
  }
};

export const getLegacyEvents = (
  blockHeader: types.BlockHeader,
  outcome: types.ExecutionOutcomeWithReceipt,
  matchActions: FTContractMatchAction,
) => {
  const eventData: FTEvent[] = [];

  if (
    outcome.receipt &&
    isExecutionSuccess(outcome.executionOutcome.outcome.status) &&
    !extractEvents(outcome).length
  ) {
    const receiptId = outcome.receipt.receiptId;
    const predecessor = outcome.receipt.predecessorId;
    const logs = outcome.executionOutcome.outcome.logs;
    const status = outcome.executionOutcome.outcome.status;
    const contractId = outcome.executionOutcome.outcome.executorId;

    if ('Action' in outcome.receipt.receipt) {
      for (const action of outcome.receipt.receipt.Action.actions) {
        if (isFunctionCallAction(action)) {
          const eventItems = matchActions(action, predecessor, logs, status);

          for (const eventItem of eventItems) {
            eventData.push({
              absolute_amount: null,
              affected_account_id: eventItem.affected,
              block_height: blockHeader.height,
              block_timestamp: blockHeader.timestampNanosec,
              cause: eventItem.cause,
              contract_account_id: contractId,
              delta_amount: eventItem.amount,
              event_index: '0',
              event_memo: eventItem.memo,
              involved_account_id: eventItem.involved,
              receipt_id: receiptId,
              standard: '',
              status: EventStatus.SUCCESS,
            });
          }
        }
      }
    }
  }

  return eventData;
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

export const ftResolveTransfer = (logs: string[]): FTEventEntry[] => {
  if (!logs.length) return [];

  const eventItems: FTEventEntry[] = [];

  logs.forEach((log) => {
    if (EVENT_PATTERN.ACCOUNT.test(log)) {
      const match = log.match(EVENT_PATTERN.ACCOUNT);

      if (match?.length === 3 && match[1] && BigInt(match[2])) {
        eventItems.push({
          affected: match[1],
          amount: String(BigInt(match[2]) * -1n),
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
