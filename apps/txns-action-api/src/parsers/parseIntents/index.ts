import { ParsedTransactionLog } from 'src/utils/types';
import { parseBurn } from './parseBurn';
import { parseMint } from './parseMint';
import { parseTransfer } from './parseTransfer';
import { ParsedEvent } from 'src/utils/types';
import { parseTokenDiff } from './parseTokendiff';

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
  const logsArr = Array.isArray(event.logs) ? event.logs : [event.logs];

  const rawFirstLog = logsArr[0] || '';
  let firstLog: any = {};

  if (
    typeof rawFirstLog === 'string' &&
    rawFirstLog.startsWith('EVENT_JSON:')
  ) {
    try {
      firstLog = JSON.parse(rawFirstLog.replace('EVENT_JSON:', ''));
    } catch (err) {
      console.error('Failed to parse EVENT_JSON log:', err);
    }
  } else if (typeof rawFirstLog === 'object') {
    firstLog = rawFirstLog;
  }

  const kind = firstLog?.standard?.toLowerCase();

  const eventType = firstLog?.event;

  const data = firstLog?.data;

  const parsedActionLogs = apiAllActions?.map((action: any) => {
    const parsedArgs = action?.args?.args_base64
      ? decodeArgs(action.args.args_base64)
      : action?.args?.args_json ?? null;
    return {
      ...action,
      parsedArgs,
    };
  });

  switch (kind) {
    case 'nep245': {
      switch (eventType) {
        case 'mt_mint': {
          const parsed = await parseMint({
            event,
            data,
            meta,
            parsedActionLogs,
          });
          return [parsed].filter(Boolean);
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
          const parsed = await parseTokenDiff({ event, data, meta });
          return parsed ? parsed : [];
        }
        default:
          return [];
      }
    }
    default:
      return [];
  }
}
