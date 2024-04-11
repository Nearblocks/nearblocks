import { EventCause, EventStandard, EventType, FTEvent } from 'nb-types';

import { decodeArgs } from '#libs/utils';
import { setEventIndex } from '#services/events';
import {
  ftResolveTransfer,
  ftTransfer,
  getLegacyEvents,
  saveFTData,
} from '#services/ft';
import { EventContract, FTContractMatchAction } from '#types/types';

type FtMint = {
  amount: string;
  receiver: string;
};
type FtBurn = {
  amount: string;
  sender: string;
};

const EVENT_TYPE = EventType.TOKEN_A11BD_NEAR;
const EVENT_STANDARD = EventStandard.FT_LEGACY;

const contract: EventContract = async ({
  blockHeader,
  knex,
  outcomes,
  shardId,
}) => {
  let events: FTEvent[] = [];

  for (const outcome of outcomes) {
    if (
      outcome.receipt?.receiverId === 'abr.a11bd.near' ||
      outcome.receipt?.receiverId === 'xabr.a11bd.near' ||
      outcome.receipt?.receiverId.endsWith('.token.a11bd.near')
    ) {
      events.push(...getLegacyEvents(blockHeader, outcome, matchActions));
    }
  }

  if (events.length) {
    events = setEventIndex(
      shardId,
      blockHeader.timestampNanosec,
      EVENT_TYPE,
      EVENT_STANDARD,
      events,
    );

    await saveFTData(knex, events);
  }
};

const matchActions: FTContractMatchAction = (action, predecessor, logs) => {
  switch (action.FunctionCall.methodName) {
    case 'mint': {
      const args = decodeArgs<FtMint>(action.FunctionCall.args);
      const amount = BigInt(args.amount);

      if (args.receiver && amount) {
        return [
          {
            affected: args.receiver,
            amount: String(amount),
            cause: EventCause.MINT,
            involved: '',
            memo: '',
          },
        ];
      }

      return [];
    }
    case 'burn': {
      const args = decodeArgs<FtBurn>(action.FunctionCall.args);
      const amount = BigInt(args.amount);

      if (args.sender && amount) {
        return [
          {
            affected: args.sender,
            amount: String(amount * -1n),
            cause: EventCause.BURN,
            involved: null,
            memo: null,
          },
        ];
      }

      return [];
    }
    case 'ft_transfer':
    case 'ft_transfer_call': {
      return ftTransfer(action.FunctionCall.args, predecessor);
    }
    case 'ft_resolve_transfer': {
      return ftResolveTransfer(logs);
    }
    default:
      return [];
  }
};

export default contract;
