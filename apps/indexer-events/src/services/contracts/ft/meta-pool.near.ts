// Only implemented token transfers
import { EventStandard, EventType, FTEvent } from 'nb-types';

import { updateFTEvents } from '#services/events';
import {
  ftResolveTransfer,
  ftTransfer,
  getLegacyEvents,
  saveFTData,
} from '#services/ft';
import { EventContract, FTContractMatchAction } from '#types/types';

const EVENT_TYPE = EventType.META_POOL_NEAR;
const EVENT_STANDARD = EventStandard.FT_LEGACY;

const contract: EventContract = async ({
  blockHeader,
  knex,
  outcomes,
  shardId,
}) => {
  let events: FTEvent[] = [];

  for (const outcome of outcomes) {
    if (outcome.receipt?.receiverId === 'meta-pool.near') {
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
