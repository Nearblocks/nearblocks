// Only implemented token transfers
import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import {
  EventCause,
  EventStandard,
  EventStatus,
  EventType,
  FTEvent,
} from 'nb-types';

import { isFunctionCallAction } from '#libs/guards';
import { isExecutionSuccess } from '#libs/utils';
import { EVENT_PATTERN, setEventIndex } from '#services/events';
import { ftTransfer, ftTransferCall, saveFTData } from '#services/ft';
import { EventContract, FTEventEntry } from '#types/types';

const EVENT_TYPE = EventType.AURORA;
const EVENT_STANDARD = EventStandard.FT_LEGACY;

const contract: EventContract = async (
  knex: Knex,
  blockHeader: types.BlockHeader,
  shardId: number,
  outcome: types.ExecutionOutcomeWithReceipt,
) => {
  if (
    outcome.receipt &&
    isExecutionSuccess(outcome.executionOutcome.outcome.status)
  ) {
    const events: FTEvent[] = [];
    const receiptId = outcome.receipt.receiptId;
    const predecessor = outcome.receipt.predecessorId;
    const logs = outcome.executionOutcome.outcome.logs;
    const contractId = outcome.executionOutcome.outcome.executorId;

    if ('Action' in outcome.receipt.receipt) {
      outcome.receipt.receipt.Action?.actions.forEach((action) => {
        if (isFunctionCallAction(action)) {
          const eventItems = matchActions(action, predecessor, logs);

          if (eventItems.length) {
            eventItems.forEach((eventItem) => {
              events.push({
                absolute_amount: '0',
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
                standard: EVENT_STANDARD,
                status: EventStatus.SUCCESS,
              });
            });
          }
        }
      });
    }

    if (events.length) {
      const data = setEventIndex(
        shardId,
        blockHeader.timestamp,
        EVENT_TYPE,
        events,
      );
      await saveFTData(knex, data);
    }
  }
};

const matchActions = (
  action: types.FunctionCallAction,
  predecessor: string,
  logs: string[],
): FTEventEntry[] => {
  switch (action.FunctionCall.methodName) {
    case 'ft_transfer': {
      return ftTransfer(action.FunctionCall.args, predecessor);
    }
    case 'ft_transfer_call': {
      return ftTransferCall(action.FunctionCall.args, predecessor);
    }
    case 'ft_resolve_transfer': {
      if (!logs.length) return [];

      const eventItems: FTEventEntry[] = [];

      logs.forEach((log) => {
        if (EVENT_PATTERN.ACCOUNT.test(log)) {
          const match = log.match(EVENT_PATTERN.ACCOUNT);

          if (match?.length === 3) {
            eventItems.push({
              affected: match[1],
              amount: match[2],
              cause: EventCause.BURN,
              involved: null,
              memo: null,
            });
          }
        }

        if (/^Refund amount (\d+) from ([\S]+) to ([\S]+)/.test(log)) {
          const match = log.match(
            /^Refund amount (\d+) from ([\S]+) to ([\S]+)/,
          );

          if (match?.length === 4) {
            eventItems.push({
              affected: match[2],
              amount: match[1],
              cause: EventCause.TRANSFER,
              involved: match[3],
              memo: null,
            });
          }
        }
      });

      return eventItems;
    }
    default:
      return [];
  }
};

export default contract;
