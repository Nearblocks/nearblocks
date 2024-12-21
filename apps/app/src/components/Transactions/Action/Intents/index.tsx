import { EventPropsInfo } from '@/utils/types';
import Mint from './Mint';
import Burn from './Burn';
import Transfer from './Transfer';

const IntentsContract = (props: EventPropsInfo) => {
  const log = props.event.logs;

  console.log({ log });

  try {
    if (log.startsWith('EVENT_JSON:')) {
      const jsonString = log.replace('EVENT_JSON:', '').trim();

      const eventJson = JSON.parse(jsonString);

      if (eventJson.standard === 'nep245') {
        switch (eventJson.event) {
          case 'mt_burn':
            return <Burn event={props.event} data={eventJson.data} />;
          case 'mt_mint':
            return <Mint event={props.event} data={eventJson.data} />;
          case 'mt_transfer':
            return <Transfer event={props.event} data={eventJson.data} />;
          default:
            return null;
        }
      }
    }
  } catch (error) {
    console.log('Failed to parse event log:', error);
  }

  return null;
};

export default IntentsContract;
