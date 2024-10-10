import { EventPropsInfo } from '@/utils/types';
import DepositToReserve from './DopositToReserve';
import Deposit from './Deposit';
import WithdrawSucceeded from './WithdrawSucceeded';
import IncreaseCollateral from './IncreaseCollateral';
import DescreaseCollateral from './DecreaseCollateral';
import Borrow from './Borrow';
import Repay from './Repay';

interface ParsedEvent {
  event: string;
  data: any;
  network: string;
}

const BurrowContract = (props: EventPropsInfo) => {
  let parsedEvent: ParsedEvent | {} = {};

  try {
    parsedEvent = JSON.parse(props?.event?.logs?.replace('EVENT_JSON:', ''));
  } catch (error) {
    console.log(error);
  }

  if ('event' in parsedEvent) {
    switch (parsedEvent?.event) {
      case 'deposit_to_reserve':
        return <DepositToReserve event={parsedEvent?.data} />;
      case 'deposit':
        return <Deposit event={parsedEvent?.data} />;
      case 'withdraw_succeeded':
        return <WithdrawSucceeded event={parsedEvent?.data} />;
      case 'increase_collateral':
        return <IncreaseCollateral event={parsedEvent?.data} />;
      case 'decrease_collateral':
        return <DescreaseCollateral event={parsedEvent?.data} />;
      case 'borrow':
        return <Borrow event={parsedEvent?.data} />;
      case 'repay':
        return <Repay event={parsedEvent?.data} />;
      default:
        return null;
    }
  }

  return null;
};

export default BurrowContract;
