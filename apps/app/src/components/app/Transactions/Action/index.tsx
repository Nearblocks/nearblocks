import { EventPropsInfo } from '@/utils/types';
import BurrowContract from '@/components/app/Transactions/Action/Burrow';
import RefContract from '@/components/app/Transactions/Action/Ref';
import WrapContract from '@/components/app/Transactions/Action/Wrap';
import IntentsContract from '@/components/app/Transactions/Action/Intents';

const EventLogs = (props: EventPropsInfo) => {
  const showContract = () => {
    switch (props.event.contract) {
      case 'wrap.near':
      case 'wrap.testnet':
        return (
          <WrapContract
            event={props.event}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'v2.ref-finance.near':
        return (
          <RefContract
            event={props.event}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'contract.main.burrow.near':
      case 'contract.1638481328.burrow.testnet':
        return (
          <BurrowContract
            event={props.event}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'intents.near':
        return (
          <IntentsContract
            event={props.event}
            allActionLog={props?.allActionLog}
            tokenMetadata={props?.tokenMetadata}
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
