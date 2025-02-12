import { EventPropsInfo } from '@/utils/types';
import Mint from './Mint';
import Burn from './Burn';
import Transfer from './Transfer';

const IntentsContract = (props: EventPropsInfo) => {
  const log = props?.event?.logs;
  const actionsLog = props?.actionsLog;
  const allActionLog = props?.allActionLog;
  // console.log({ log });

  const decodeArgs = (args: string | undefined): Record<string, any> | null => {
    if (!args) return null;
    try {
      const decodedString = atob(args);
      return JSON.parse(decodedString);
    } catch (error) {
      console.log('Failed to decode or parse args:', error);
      return null;
    }
  };

  const parsedActionLogs = allActionLog?.map((action: any) => {
    const parsedArgs = decodeArgs(action?.args?.args);
    return {
      ...action,
      parsedArgs,
    };
  });

  try {
    if (log?.startsWith('EVENT_JSON:')) {
      const jsonString = log?.replace('EVENT_JSON:', '').trim();

      const eventJson = JSON.parse(jsonString);

      if (eventJson?.standard === 'nep245') {
        switch (eventJson?.event) {
          case 'mt_burn':
            return (
              <Burn
                event={props?.event}
                data={eventJson?.data}
                actionsLog={actionsLog}
              />
            );
          case 'mt_mint':
            return (
              <Mint
                event={props?.event}
                data={eventJson?.data}
                parsedActionLogs={parsedActionLogs}
              />
            );

          default:
            return null;
        }
      } else if (eventJson?.standard === 'dip4') {
        switch (eventJson?.event) {
          case 'token_diff':
            return <Transfer event={props?.event} data={eventJson?.data} />;
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
