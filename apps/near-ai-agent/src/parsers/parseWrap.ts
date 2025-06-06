import { parsedWrap, TokenMetadataMap } from 'src/utils/types';

export default function parsewrap(
  log: any,
  tokenMetadata: TokenMetadataMap,
): parsedWrap[] {
  const logs = log.logs || [];
  const results: parsedWrap[] = [];
  const contract = log.contract;

  const meta = tokenMetadata?.[contract];

  for (const line of logs) {
    let parsedEvent: parsedWrap | null = null;

    const depositMatch = line.match(/^Deposit (\d+) NEAR to ([\S]+)/);
    if (depositMatch) {
      parsedEvent = {
        type: 'wrap_deposit',
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

    const withdrawMatch = line.match(/^Withdraw (\d+) NEAR from ([\S]+)/);
    if (withdrawMatch) {
      parsedEvent = {
        type: 'wrap_withdraw',
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
