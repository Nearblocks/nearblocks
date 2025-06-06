import { ParsedRef, TokenMetadataMap } from 'src/utils/types';

export default function parseRef(
  log: any,
  tokenMetadata: TokenMetadataMap,
): ParsedRef[] {
  const logs = log.logs || [];
  const results: ParsedRef[] = [];

  for (const line of logs) {
    const match = line.match(/^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/);
    if (match) {
      const [, amountIn, tokenIn, amountOut, tokenOutRaw] = match;
      const tokenOut = tokenOutRaw.replace(/,$/, '');

      const tokenInMeta = tokenMetadata?.[tokenIn];
      const tokenOutMeta = tokenMetadata?.[tokenOut];

      results.push({
        type: 'swap',
        amountIn,
        tokenIn,
        tokenInMeta,
        amountOut,
        tokenOut,
        tokenOutMeta,
        contract: log.contract,
        receiptId: log.receiptId,
        platform: 'Ref Finance',
      });
    }
  }

  return results;
}
