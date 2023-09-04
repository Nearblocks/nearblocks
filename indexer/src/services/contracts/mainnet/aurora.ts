// Not sure about mint & burn txns. Only implemented token transfers
import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import log from '#libs/log';
import { FtEventKind } from '#ts/enums';
import { EventType } from '#services/events';
import { isExecutionSuccess } from '#libs/utils';
import { EVENT_PATTERN } from '#services/events';
import { isFunctionCallAction } from '#libs/guards';
import {
  FtEventEntry,
  EventContract,
  AssetsFungibleTokenEvent,
} from '#ts/types';
import {
  getFTData,
  saveFTData,
  ftTransfer,
  ftTransferCall,
} from '#services/ft';

const EVENT_TYPE = EventType.AURORA;

const contract: EventContract = async (
  knex: Knex,
  block: types.BlockHeader,
  shardId: number,
  outcome: types.ExecutionOutcomeWithReceipt,
) => {
  try {
    if (
      outcome.receipt &&
      isExecutionSuccess(outcome.executionOutcome.outcome.status)
    ) {
      const events: AssetsFungibleTokenEvent[] = [];
      const predecessor = outcome.receipt.predecessorId;
      const logs = outcome.executionOutcome.outcome.logs;
      const receipt = {
        receiptId: outcome.receipt.receiptId,
        blockTimestamp: block.timestampNanosec,
        shardId: shardId,
        eventType: EVENT_TYPE,
        receiverId: outcome.receipt.receiverId,
      };

      if ('Action' in outcome.receipt.receipt) {
        outcome.receipt.receipt.Action?.actions.forEach((action) => {
          if (isFunctionCallAction(action)) {
            try {
              const eventItems = matchActions(action, predecessor, logs);

              if (eventItems.length) {
                eventItems.forEach((eventItem) =>
                  events.push(getFTData(receipt, events.length, eventItem)),
                );
              }
            } catch (error) {
              log.error(error);
            }
          }
        });
      }

      if (events.length) {
        await saveFTData(knex, events);
      }
    }
  } catch (error) {
    log.error(error);
  }
};

const matchActions = (
  action: types.FunctionCallAction,
  predecessor: string,
  logs: string[],
): FtEventEntry[] => {
  switch (action.FunctionCall.methodName) {
    case 'ft_transfer': {
      return ftTransfer(action.FunctionCall.args, predecessor);
    }
    case 'ft_transfer_call': {
      return ftTransferCall(action.FunctionCall.args, predecessor);
    }
    case 'ft_resolve_transfer': {
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

        if (/^Refund amount (\d+) from ([\S]+) to ([\S]+)/.test(log)) {
          const match = log.match(
            /^Refund amount (\d+) from ([\S]+) to ([\S]+)/,
          );

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
    }
    default:
      return [];
  }
};

export default contract;
