import Swap from '@/includes/Common/Action/Ref/Swap';
import { EventPropsInfo } from '@/includes/types';

const RefContract = (props: EventPropsInfo) => {
  switch (true) {
    case /^Swapped.*/.test(props.event.logs):
      return (
        <Swap
          event={props.event}
          network={props.network}
          ownerId={props.ownerId}
        />
      );

    default:
      return null;
  }
};

export default RefContract;
