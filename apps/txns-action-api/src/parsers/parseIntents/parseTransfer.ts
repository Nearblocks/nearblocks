import { TransactionLog } from 'src/utils/types';

interface TokenDiffEvent {
  account_id: string;
  diff: Record<string, string>;
  intent_hash?: string;
}

interface TransferInput {
  event: TransactionLog;
  data: TokenDiffEvent[] | TokenDiffEvent;
  meta: any;
}

export async function parseTransfer({ event, data, meta }: TransferInput) {
  const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

  const userSwaps = normalizedData.reduce(
    (acc, { account_id, diff }) => {
      const swapData = acc[account_id] || { sent: [], received: [] };

      if (typeof diff === 'object') {
        Object.entries(diff).forEach(([token, amount]) => {
          const bigIntAmount = BigInt(amount);
          const tokenId = token.split(':')[1] || token;

          if (bigIntAmount > 0n) {
            swapData.received.push({ token: tokenId, amount });
          } else if (bigIntAmount < 0n) {
            swapData.sent.push({
              token: tokenId,
              amount: amount.replace('-', ''),
            });
          }
        });
      }

      if (swapData.sent.length > 0 && swapData.received.length > 0) {
        acc[account_id] = swapData;
      }

      return acc;
    },
    {} as Record<string, { sent: any[]; received: any[] }>,
  );

  const validSwaps = Object.entries(userSwaps).map(
    ([accountId, { sent, received }]) => ({
      accountId,
      sent: sent.map((s) => ({
        ...s,
        meta: meta?.[s.token] || [],
      })),
      received: received.map((r) => ({
        ...r,
        meta: meta?.[r.token] || [],
      })),
    }),
  );

  if (validSwaps.length === 0) return null;

  return {
    type: 'Swap',
    contract: 'intents.near',
    swaps: validSwaps,
    roles: {
      senderLabel: 'For',
      receiverLabel: 'On',
    },
    receiptId: event?.receiptId ?? '',
  };
}
