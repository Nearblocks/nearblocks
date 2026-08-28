import { ParsedEvent, TokenMetadataMap } from 'src/utils/types';

export default function parseBurrowEvents(
  log: any,
  tokenMetadata: TokenMetadataMap,
): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const logs = Array.isArray(log.logs) ? log.logs : [log.logs];
  const contract = log.contract;
  const receiptId = log.receiptId;

  for (const rawLog of logs) {
    if (typeof rawLog !== 'string' || !rawLog.startsWith('EVENT_JSON:'))
      continue;

    try {
      const { event, data } = JSON.parse(rawLog.replace('EVENT_JSON:', ''));

      if (
        [
          'deposit',
          'deposit_to_reserve',
          'withdraw_succeeded',
          'increase_collateral',
          'decrease_collateral',
          'borrow',
          'repay',
        ].includes(event)
      ) {
        events.push({
          type: event,
          receiptId,
          data: data?.[0] ?? {},
          contract,
        });
      }
    } catch (e) {
      console.warn('Failed to parse Burrow event log:', e);
    }
  }

  return events;
}
