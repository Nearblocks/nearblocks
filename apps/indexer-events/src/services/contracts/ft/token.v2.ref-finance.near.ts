import { EventCause, EventStandard, EventType, FTEvent } from 'nb-types';

import { decodeArgs } from '#libs/utils';
import { updateFTEvents } from '#services/events';
import {
  ftResolveTransfer,
  ftTransfer,
  getLegacyEvents,
  saveFTData,
} from '#services/ft';
import {
  EventContract,
  FTContractMatchAction,
  FTMetaArgsRefToken,
} from '#types/types';

const EVENT_TYPE = EventType.TOKEN_V2_REF_FINANCE_NEAR;
const EVENT_STANDARD = EventStandard.FT_LEGACY;

const contract: EventContract = async ({
  blockHeader,
  knex,
  outcomes,
  shardId,
}) => {
  let events: FTEvent[] = [];

  for (const outcome of outcomes) {
    if (outcome.receipt?.receiverId === 'token.v2.ref-finance.near') {
      events.push(...getLegacyEvents(blockHeader, outcome, matchActions));
    }
  }

  if (events.length) {
    events = updateFTEvents(shardId, EVENT_TYPE, EVENT_STANDARD, events);

    await saveFTData(knex, events);
  }
};

const matchActions: FTContractMatchAction = (action, predecessor, logs) => {
  switch (action.FunctionCall.methodName) {
    case 'new': {
      const args = decodeArgs<FTMetaArgsRefToken>(action.FunctionCall.args);
      const amount = BigInt(args.total_supply);

      if (args.owner && amount) {
        return [
          {
            affected: args.owner,
            amount: String(amount),
            cause: EventCause.MINT,
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
