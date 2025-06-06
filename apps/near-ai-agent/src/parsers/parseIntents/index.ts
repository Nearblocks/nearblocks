import { ParsedTransactionLog } from 'src/utils/types';
import { parseBurn } from './parseBurn';
import { parseMint } from './parseMint';
import { parseTransfer } from './parseTransfer';
import { ParsedEvent } from 'src/utils/types';

export async function parseIntents(
  event: ParsedTransactionLog,
  meta: any,
): Promise<ParsedEvent[]> {
  const logsArr = Array.isArray(event.logs) ? event.logs : [];
  const firstLog = logsArr[0] || {};

  const kind = firstLog?.standard?.toLowerCase();
  const data = firstLog?.data;
  const parsedLogs = event?.parsedActionLogs;

  switch (kind) {
    case 'mint': {
      const parsed = await parseMint({
        event,
        data,
        meta,
        parsedActionLogs: parsedLogs,
      });
      return [parsed];
    }
    case 'transfer': {
      const parsed = await parseTransfer({ event, data, meta });
      return [parsed];
    }
    case 'burn': {
      const parsed = await parseBurn({ event, data, meta });
      return [parsed];
    }
    default:
      return [];
  }
}
