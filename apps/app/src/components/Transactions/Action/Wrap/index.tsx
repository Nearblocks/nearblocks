import { EventPropsInfo } from '@/utils/types';

import Withdraw from './Withdraw';
import WrapDeposit from './WrapDeposit';

const WrapContract = (props: EventPropsInfo) => {
  switch (true) {
    case /^Deposit.*/.test(props.event.logs):
      return <WrapDeposit event={props.event} />;
    case /^Withdraw.*/.test(props.event.logs):
      return <Withdraw event={props.event} />;

    default:
      return null;
  }
};

export default WrapContract;
