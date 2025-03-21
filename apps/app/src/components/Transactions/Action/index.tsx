import { EventPropsInfo } from '@/utils/types';
import BurrowContract from './Burrow';
import RefContract from './Ref';
import WrapContract from './Wrap';
import IntentsContract from './Intents';

const EventLogs = (props: EventPropsInfo) => {
  const showContract = () => {
    switch (props.event.contract) {
      case 'wrap.near':
      case 'wrap.testnet':
        return <WrapContract event={props.event} />;
      case 'v2.ref-finance.near':
        return <RefContract event={props.event} />;
      case 'contract.main.burrow.near':
      case 'contract.1638481328.burrow.testnet':
        return <BurrowContract event={props.event} />;
      case 'intents.near':
        return (
          <IntentsContract
            event={props.event}
            allActionLog={props?.allActionLog}
            isInteracted={props?.isInteracted}
          />
        );
      default:
        return null;
    }
  };

  return <>{showContract()}</>;
};

export default EventLogs;
