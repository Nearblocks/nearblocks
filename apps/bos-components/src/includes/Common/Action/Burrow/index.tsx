import { EventPropsInfo } from '@/includes/types';
import DepositToReserve from '@/includes/Common/Action/Burrow/DopositToReserve';
import Deposit from '@/includes/Common/Action/Burrow/Deposit';
import WithdrawSucceeded from '@/includes/Common/Action/Burrow/WithdrawSucceeded';
import IncreaseCollateral from '@/includes/Common/Action/Burrow/IncreaseCollateral';
import DescreaseCollateral from '@/includes/Common/Action/Burrow/DecreaseCollateral';
import Borrow from '@/includes/Common/Action/Burrow/Borrow';
import Repay from '@/includes/Common/Action/Burrow/Repay';

interface ParsedEvent {
  event: string;
  data: any;
  network: string;
}

const BurrowContract = (props: EventPropsInfo) => {
  let parsedEvent: ParsedEvent | {} = {};

  try {
    parsedEvent = JSON.parse(props.event.logs.replace('EVENT_JSON:', ''));
  } catch (error) {
    console.log(error);
  }

  if ('event' in parsedEvent) {
    switch (parsedEvent.event) {
      case 'deposit_to_reserve':
        return (
          <DepositToReserve
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      case 'deposit':
        return (
          <Deposit
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      case 'withdraw_succeeded':
        return (
          <WithdrawSucceeded
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      case 'increase_collateral':
        return (
          <IncreaseCollateral
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      case 'decrease_collateral':
        return (
          <DescreaseCollateral
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      case 'borrow':
        return (
          <Borrow
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      case 'repay':
        return (
          <Repay
            event={parsedEvent.data}
            network={props.network}
            ownerId={props.ownerId}
          />
        );
      default:
        return null;
    }
  }

  return null;
};

export default BurrowContract;
