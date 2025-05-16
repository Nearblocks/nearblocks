import { EventPropsInfo } from '@/utils/types';

import Withdraw from '@/components/app/Transactions/Action/Wrap/Withdraw';
import WrapDeposit from '@/components/app/Transactions/Action/Wrap/WrapDeposit';

const WrapContract = (props: EventPropsInfo) => {
  switch (true) {
    case /^Deposit.*/.test(props.event.logs):
      return (
        <WrapDeposit event={props.event} tokenMetadata={props?.tokenMetadata} />
      );
    case /^Withdraw.*/.test(props.event.logs):
      return (
        <Withdraw event={props.event} tokenMetadata={props?.tokenMetadata} />
      );

    default:
      return null;
  }
};

export default WrapContract;
