import { ParsedEvent, TokenMetadataMap } from 'src/utils/types';
import parsewrap from './parseWrap';
import parseRef from './parseRef';
import parseBurrowEvents from './parseBurrow';
import { parseIntents } from './parseIntents';

export async function parseEventLogs(
  logs: any[],
  tokenMetadata: TokenMetadataMap,
  apiAllActions?: any,
): Promise<ParsedEvent[]> {
  const result: ParsedEvent[] = [];

  for (const log of logs) {
    const contract = log.contract;

    switch (contract) {
      case 'wrap.near':
      case 'wrap.testnet':
        result.push(...parsewrap(log, tokenMetadata));
        break;
      case 'v2.ref-finance.near':
        result.push(...parseRef(log, tokenMetadata));
        break;
      case 'contract.main.burrow.near':
      case 'contract.1638481328.burrow.testnet':
        result.push(...parseBurrowEvents(log, tokenMetadata));
        break;
      case 'intents.near':
        const parsed = await parseIntents(log, tokenMetadata, apiAllActions);
        result.push(...parsed);
        break;
      default:
        break;
    }
  }

  return result;
}
