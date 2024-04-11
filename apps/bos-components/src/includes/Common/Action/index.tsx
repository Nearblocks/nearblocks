import WrapContract from '@/includes/Common/Action/Wrap/index';
import RefContract from '@/includes/Common/Action/Ref/index';
import { EventPropsInfo } from '@/includes/types';
import BurrowContract from '@/includes/Common/Action/Burrow/index';

const EventLogs = (props: EventPropsInfo) => {
  switch (props.event.contract) {
    case 'wrap.near':
    case 'wrap.testnet':
      return (
        <WrapContract
          event={props.event}
          network={props.network}
          ownerId={props.ownerId}
        />
      );
    case 'v2.ref-finance.near':
      return (
        <RefContract
          event={props.event}
          network={props.network}
          ownerId={props.ownerId}
        />
      );
    case 'contract.main.burrow.near':
    case 'contract.1638481328.burrow.testnet':
      return (
        <BurrowContract
          event={props.event}
          network={props.network}
          ownerId={props.ownerId}
        />
      );
    default:
      return null;
  }
};

export default EventLogs;
