import { EventPropsInfo } from '@/utils/types';
import WrapDeposit from './WrapDeposit';
import Withdraw from './Withdraw';

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
