import { ParsedTransactionLog } from 'src/utils/types';
import { parseBurn } from './parseBurn';
import { parseMint } from './parseMint';
import { parseTransfer } from './parseTransfer';
import { ParsedEvent } from 'src/utils/types';

function decodeArgs(args: string | undefined): Record<string, any> | null {
  if (!args) return null;
  try {
    const decodedString = Buffer.from(args, 'base64').toString('utf-8');
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Failed to decode args:', error);
    return null;
  }
}

export async function parseIntents(
  event: ParsedTransactionLog,
  meta: any,
  apiAllActions?: any,
): Promise<ParsedEvent[]> {
  const logsArr = Array.isArray(event.logs) ? event.logs : [];
  const firstLog = logsArr[0] || {};

  const kind = firstLog?.standard?.toLowerCase();
  const eventType = firstLog?.event;
  const data = firstLog?.data;
  const parsedActionLogs = apiAllActions?.map((action: any) => {
    const parsedArgs = decodeArgs(action?.args?.args);
    return {
      ...action,
      parsedArgs,
    };
  });

  switch (kind) {
    case 'nep245': {
      switch (eventType) {
        case 'mint': {
          const parsed = await parseMint({
            event,
            data,
            meta,
            parsedActionLogs,
          });
          return [parsed];
        }
        case 'mt_transfer': {
          const parsed = await parseTransfer({ event, data, meta });
          return [parsed];
        }
        case 'mt_burn': {
          const parsed = await parseBurn({ event, data, meta });
          return [parsed];
        }
        default:
          return [];
      }
    }
    case 'dip4': {
      switch (eventType) {
        case 'token_diff': {
          const parsed = await parseTransfer({ event, data, meta });
          return [parsed];
        }
        default:
          return [];
      }
    }
    default:
      return [];
  }
}
