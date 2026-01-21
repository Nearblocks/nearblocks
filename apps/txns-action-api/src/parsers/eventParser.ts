import { ParsedEvent, TokenMetadataMap } from 'src/utils/types';
import parsewrap from './parseWrap';
import parseRef from './parseRef';
import parseBurrowEvents from './parseBurrow';
import { parseIntents } from './parseIntents';

export async function parseEventLogs(
  log: any,
  tokenMetadata: TokenMetadataMap,
  apiAllActions?: any,
): Promise<ParsedEvent[]> {
  const result: ParsedEvent[] = [];

  const contract = log.contract;

  switch (contract) {
    case 'wrap.near': {
      const parsed = parsewrap(log, tokenMetadata);
      result.push(...parsed);
      break;
    }
    case 'v2.ref-finance.near': {
      const parsed = parseRef(log, tokenMetadata);
      result.push(...parsed);
      break;
    }
    case 'contract.main.burrow.near': {
      const parsed = parseBurrowEvents(log, tokenMetadata);
      result.push(...parsed);
      break;
    }
    case 'intents.near': {
      const parsed = await parseIntents(log, tokenMetadata, apiAllActions);
      result.push(...parsed);
      break;
    }
    default:
      break;
  }

  return result;
}
