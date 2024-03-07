import { EventCause, EventStandard, EventType, FTEvent } from 'nb-types';

import { decodeArgs } from '#libs/utils';
import { setEventIndex } from '#services/events';
import {
  ftResolveTransfer,
  ftTransfer,
  getLegacyEvents,
  saveFTData,
} from '#services/ft';
import { EventContract, FTContractMatchAction, FTMeta } from '#types/types';

export type FTMetaArgs = {
  metadata: FTMeta;
  owner_id: string;
  premined_balance: string;
  premined_beneficiary: string;
  total_supply: string;
};
export type FTArgs = {
  account_id: string;
  amount: string;
};

const EVENT_TYPE = EventType.FUSOTAO_TOKEN;
const EVENT_STANDARD = EventStandard.FT_LEGACY;

const contract: EventContract = async ({
  blockHeader,
  knex,
  outcomes,
  shardId,
}) => {
  let events: FTEvent[] = [];

  for (const outcome of outcomes) {
    if (outcome.receipt?.receiverId === 'fusotao-token.near') {
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
    case 'new': {
      const args = decodeArgs<FTMetaArgs>(action.FunctionCall.args);
      const amount = BigInt(args.premined_balance);

      if (predecessor && amount) {
        return [
          {
            affected: predecessor,
            amount: String(amount),
            cause: EventCause.MINT,
            involved: null,
            memo: null,
          },
        ];
      }

      return [];
    }
    case 'mint': {
      const args = decodeArgs<FTArgs>(action.FunctionCall.args);
      const amount = BigInt(args.amount);

      if (predecessor && amount) {
        return [
          {
            affected: predecessor,
            amount: String(amount),
            cause: EventCause.MINT,
            involved: null,
            memo: null,
          },
        ];
      }

      return [];
    }
    case 'burn': {
      const args = decodeArgs<FTArgs>(action.FunctionCall.args);
      const amount = BigInt(args.amount);

      if (args.account_id && amount) {
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
