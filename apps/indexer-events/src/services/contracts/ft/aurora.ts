import * as borsh from 'borsh';

import { EventCause, EventStandard, EventType, FTEvent } from 'nb-types';

import { EVENT_PATTERN, setEventIndex } from '#services/events';
import { ftTransfer, getLegacyEvents, saveFTData } from '#services/ft';
import {
  EventContract,
  FTContractMatchAction,
  FTEventEntry,
} from '#types/types';

type WithdrawArgs = {
  amount: bigint;
  recipient_address: unknown;
};

const EVENT_TYPE = EventType.AURORA;
const EVENT_STANDARD = EventStandard.FT_LEGACY;
// order of keys matters in the Borsh schema
const withdrawSchema = {
  struct: {
    recipient_address: { array: { len: 20, type: 'u8' } },
    // eslint-disable-next-line perfectionist/sort-objects
    amount: 'u128',
  },
};

const contract: EventContract = async ({
  blockHeader,
  knex,
  outcomes,
  shardId,
}) => {
  let events: FTEvent[] = [];

  for (const outcome of outcomes) {
    if (outcome.receipt?.receiverId === 'aurora') {
      events.push(...getLegacyEvents(blockHeader, outcome, matchActions));
    }
  }

  if (events.length) {
    events = setEventIndex(
      shardId,
      blockHeader.timestamp,
      EVENT_TYPE,
      EVENT_STANDARD,
      events,
    );

    await saveFTData(knex, events);
  }
};

const matchActions: FTContractMatchAction = (action, predecessor, logs) => {
  switch (action.FunctionCall.methodName) {
    case 'finish_deposit': {
      if (!logs.length) return [];

      const eventItems: FTEventEntry[] = [];

      logs.forEach((log) => {
        if (EVENT_PATTERN.AURORA_FINISH_DEPOSIT.test(log)) {
          const match = log.match(EVENT_PATTERN.AURORA_FINISH_DEPOSIT);

          if (match?.length === 3 && BigInt(match[1])) {
            eventItems.push({
              affected: match[2],
              amount: match[1],
              cause: EventCause.MINT,
              involved: null,
              memo: null,
            });
          }
        }
      });

      return eventItems;
    }
    case 'withdraw': {
      const args = borsh.deserialize(
        withdrawSchema,
        Buffer.from(action.FunctionCall.args, 'base64'),
      ) as WithdrawArgs;

      if (args.amount) {
        return [
          {
            affected: predecessor,
            amount: String(args.amount * -1n),
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
      if (!logs.length) return [];

      const eventItems: FTEventEntry[] = [];

      logs.forEach((log) => {
        if (EVENT_PATTERN.ACCOUNT.test(log)) {
          const match = log.match(EVENT_PATTERN.ACCOUNT);

          if (match?.length === 3 && BigInt(match[2])) {
            eventItems.push({
              affected: match[1],
              amount: String(BigInt(match[2]) * -1n),
              cause: EventCause.BURN,
              involved: null,
              memo: null,
            });
          }
        }

        if (EVENT_PATTERN.AURORA_REFUND.test(log)) {
          const match = log.match(EVENT_PATTERN.AURORA_REFUND);

          if (match?.length === 4 && BigInt(match[1])) {
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
    }
    default:
      return [];
  }
};

export default contract;
