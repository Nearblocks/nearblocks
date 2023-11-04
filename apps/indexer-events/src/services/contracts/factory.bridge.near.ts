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
import { decodeArgs, isExecutionSuccess } from '#libs/utils';
import { setEventIndex } from '#services/events';
import {
  ftResolveTransfer,
  ftTransfer,
  ftTransferCall,
  saveFTData,
} from '#services/ft';
import { EventContract, FTEventEntry } from '#types/types';

type FtMint = {
  account_id: string;
  amount: string;
};
type FtWithdraw = {
  amount: string;
  recipient: string;
};

const EVENT_TYPE = EventType.FACTORY_BRIDGE_NEAR;
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
    case 'mint': {
      const args = decodeArgs<FtMint>(action.FunctionCall.args);

      if (!args.account_id || !BigInt(args.amount)) {
        return [];
      }

      return [
        {
          affected: args.account_id,
          amount: args.amount,
          cause: EventCause.MINT,
          involved: null,
          memo: null,
        },
      ];
    }
    case 'withdraw': {
      const args = decodeArgs<FtWithdraw>(action.FunctionCall.args);

      if (!BigInt(args.amount)) {
        return [];
      }

      return [
        {
          affected: predecessor,
          amount: args.amount,
          cause: EventCause.BURN,
          involved: null,
          memo: null,
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