import { parsedWrap, TokenMetadataMap } from 'src/utils/types';

export default function parsewrap(
  log: any,
  tokenMetadata: TokenMetadataMap,
): parsedWrap[] {
  const logs = Array.isArray(log.logs) ? log.logs : [log.logs];

  const results: parsedWrap[] = [];
  const contract = log.contract;

  const meta = tokenMetadata?.[contract];

  for (const line of logs) {
    if (typeof line !== 'string') continue;

    const trimmed = line.trim();
    let parsedEvent: parsedWrap | null = null;

    const depositMatch = trimmed.match(
      /^Deposit\s+(\d+)\s+NEAR\s+to\s+([^\s]+)/,
    );
    if (depositMatch) {
      parsedEvent = {
        type: 'Mint',
        amount: depositMatch[1],
        recipient: depositMatch[2],
        contract,
        receiptId: log.receiptId,
        token: meta
          ? {
              symbol: meta.symbol,
              name: meta.name,
              decimals: meta.decimals,
              icon: meta.icon ?? '',
            }
          : null,
      };
    }

    const withdrawMatch = trimmed.match(
      /^Withdraw\s+(\d+)\s+NEAR\s+from\s+([^\s]+)/,
    );
    if (withdrawMatch) {
      parsedEvent = {
        type: 'Burn',
        amount: withdrawMatch[1],
        sender: withdrawMatch[2],
        contract,
        receiptId: log.receiptId,
        token: meta
          ? {
              symbol: meta.symbol,
              name: meta.name,
              decimals: meta.decimals,
              icon: meta.icon ?? '',
            }
          : null,
      };
    }

    if (parsedEvent) results.push(parsedEvent);
  }

  return results;
}
