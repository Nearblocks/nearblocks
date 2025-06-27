import { EventPropsInfo } from '@/utils/types';
import Mint from '@/components/app/Transactions/Action/Intents/Mint';
import Burn from '@/components/app/Transactions/Action/Intents/Burn';
import Transfer from '@/components/app/Transactions/Action/Intents/Transfer';

const IntentsContract = (props: EventPropsInfo) => {
  let log = props?.event?.logs;

  const allActionLog = props?.allActionLog;
  const metaData = props?.tokenMetadata;
  const isInteracted = props?.isInteracted;

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
    if (typeof log === 'string' && log.startsWith('EVENT_JSON:')) {
      const jsonString = log.replace('EVENT_JSON:', '').trim();
      try {
        log = JSON.parse(jsonString);
      } catch (jsonError) {
        console.error('Failed to parse EVENT_JSON log:', jsonError);
        return null;
      }
    }

    if (log?.standard === 'nep245') {
      switch (log?.event) {
        case 'mt_burn':
          return <Burn event={props?.event} data={log?.data} meta={metaData} />;
        case 'mt_mint':
          return (
            <Mint
              event={props?.event}
              data={log?.data}
              parsedActionLogs={parsedActionLogs}
              meta={metaData}
            />
          );
        case 'mt_transfer':
          return (
            isInteracted && (
              <Transfer event={props?.event} data={log?.data} meta={metaData} />
            )
          );
        default:
          return null;
      }
    } else if (log?.standard === 'dip4') {
      switch (log?.event) {
        case 'token_diff':
          return (
            !isInteracted && (
              <Transfer event={props?.event} data={log?.data} meta={metaData} />
            )
          );
        default:
          return null;
      }
    }
  } catch (error) {
    console.log('Failed to parse event log:', error);
  }

  return null;
};

export default IntentsContract;
