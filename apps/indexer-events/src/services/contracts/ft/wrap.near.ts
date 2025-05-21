import { EventCause, EventStandard, EventType, FTEvent } from 'nb-types';

import { decodeArgs } from '#libs/utils';
import { EVENT_PATTERN, updateFTEvents } from '#services/events';
import {
  ftResolveTransfer,
  ftTransfer,
  getLegacyEvents,
  saveFTData,
} from '#services/ft';
import {
  EventContract,
  FTContractMatchAction,
  FTEventEntry,
} from '#types/types';

type FtWithdraw = {
  amount: string;
};

const EVENT_TYPE = EventType.WRAP_NEAR;
const EVENT_STANDARD = EventStandard.FT_LEGACY;

const contract: EventContract = async ({
  blockHeader,
  knex,
  outcomes,
  shardId,
}) => {
  let events: FTEvent[] = [];

  for (const outcome of outcomes) {
    if (outcome.receipt?.receiverId === 'wrap.near') {
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
    case 'near_deposit': {
      const items: FTEventEntry[] = [];

      logs.forEach((log) => {
        if (EVENT_PATTERN.WRAP_NEAR_DEPOSIT.test(log)) {
          const match = log.match(EVENT_PATTERN.WRAP_NEAR_DEPOSIT);

          if (match?.length === 3 && match[2] && BigInt(match[1])) {
            items.push({
              affected: match[2],
              amount: match[1],
              cause: EventCause.MINT,
              involved: null,
              memo: null,
            });
          }
        }
      });

      return items;
    }
    case 'near_withdraw': {
      const args = decodeArgs<FtWithdraw>(action.FunctionCall.args);
      const amount = BigInt(args.amount);

      if (amount) {
        return [
          {
            affected: predecessor,
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
