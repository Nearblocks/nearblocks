import { ParsedRef, TokenMetadataMap } from 'src/utils/types';

export default function parseRef(
  log: any,
  tokenMetadata: TokenMetadataMap,
): ParsedRef[] {
  const logs = Array.isArray(log.logs) ? log.logs : [log.logs];
  const results: ParsedRef[] = [];

  for (const line of logs) {
    const match = line.match(/^Swapped (\d+) ([^\s]+) for (\d+) ([^\s]+)$/);

    if (match) {
      const [, amountIn, tokenIn, amountOut, tokenOut] = match;

      results.push({
        type: 'Swap',
        amountIn,
        tokenIn,
        tokenInMeta: tokenMetadata?.[tokenIn],
        amountOut,
        tokenOut,
        tokenOutMeta: tokenMetadata?.[tokenOut],
        contract: log.contract,
        receiptId: log.receiptId,
        platform: 'ref_finance',
        roles: {
          receiverLabel: 'On',
        },
      });
    }
  }

  return results;
}
