import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import log from '#libs/log';
import { FtEventKind } from '#ts/enums';
import { isFunctionCallAction } from '#libs/guards';
import { EventType, EVENT_PATTERN } from '#services/events';
import { decodeArgs, isExecutionSuccess } from '#libs/utils';
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
  ftResolveTransfer,
} from '#services/ft';

type FtWithdraw = {
  amount: string;
};

const EVENT_TYPE = EventType.WRAP_NEAR;

const contract: EventContract = async (
  knex: Knex,
  block: types.BlockHeader,
  shardId: number,
  outcome: types.ExecutionOutcomeWithReceipt,
) => {
  try {
    if (
      outcome.receipt &&
      outcome.executionOutcome.outcome.logs &&
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
    case 'near_deposit': {
      const items: FtEventEntry[] = [];

      logs.forEach((log) => {
        if (EVENT_PATTERN.WRAP_NEAR_DEPOSIT.test(log)) {
          const match = log.match(EVENT_PATTERN.WRAP_NEAR_DEPOSIT);

          if (match?.length === 3) {
            items.push({
              kind: FtEventKind.MINT,
              amount: match[1],
              from: '',
              to: match[2],
              memo: '',
            });
          }
        }
      });

      return items;
    }
    case 'near_withdraw': {
      const args = decodeArgs<FtWithdraw>(action.FunctionCall.args);

      return [
        {
          kind: FtEventKind.BURN,
          amount: args.amount,
          from: predecessor,
          to: '',
          memo: '',
        },
      ];
    }
    case 'ft_transfer': {
      return ftTransfer(action.FunctionCall.args, predecessor);
    }
    case 'ft_transfer_call': {
      return ftTransferCall(action.FunctionCall.args, predecessor);
    }
    case 'ft_resolve_transfer': {
      return ftResolveTransfer(logs);
    }
    default:
      return [];
  }
};

export default contract;
