import { EventPropsInfo } from '@/utils/types';

import Borrow from './Borrow';
import DescreaseCollateral from './DecreaseCollateral';
import Deposit from './Deposit';
import DepositToReserve from './DopositToReserve';
import IncreaseCollateral from './IncreaseCollateral';
import Repay from './Repay';
import WithdrawSucceeded from './WithdrawSucceeded';

interface ParsedEvent {
  data: any;
  event: string;
  network: string;
}

const BurrowContract = (props: EventPropsInfo) => {
  let parsedEvent: {} | ParsedEvent = {};

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
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'deposit':
        return (
          <Deposit
            event={parsedEvent.data}
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'withdraw_succeeded':
        return (
          <WithdrawSucceeded
            event={parsedEvent.data}
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'increase_collateral':
        return (
          <IncreaseCollateral
            event={parsedEvent.data}
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'decrease_collateral':
        return (
          <DescreaseCollateral
            event={parsedEvent.data}
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'borrow':
        return (
          <Borrow
            event={parsedEvent.data}
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      case 'repay':
        return (
          <Repay
            event={parsedEvent.data}
            receiptId={props?.event?.receiptId}
            tokenMetadata={props?.tokenMetadata}
          />
        );
      default:
        return null;
    }
  }

  return null;
};

export default BurrowContract;
