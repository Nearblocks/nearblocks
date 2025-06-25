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
  console.log('meta from parsetransfer', meta);
  const normalizedData = Array.isArray(data) ? data : [data];
  const swaps = normalizedData.reduce(
    (acc, { account_id, diff }) => {
      const existing = acc[account_id] || { sent: [], received: [] };
      for (const [token, amount] of Object.entries(diff || {})) {
        const amt = BigInt(amount);
        const tokenId = token.split(':')[1] || token;
        if (amt > 0n) {
          existing.received.push({ token: tokenId, amount });
        } else if (amt < 0n) {
          existing.sent.push({
            token: tokenId,
            amount: amount.replace('-', ''),
          });
        }
      }
      if (existing.sent.length && existing.received.length) {
        acc[account_id] = existing;
      }
      return acc;
    },
    {} as Record<string, { sent: any[]; received: any[] }>,
  );

  return {
    type: 'transfer',
    contract: 'intents.near',
    swaps: Object.entries(swaps).map(([accountId, { sent, received }]) => ({
      accountId,
      sent: sent.map((s) => ({
        ...s,
        meta: meta[s.token] || [],
      })),
      received: received.map((r) => ({
        ...r,
        meta: meta[r.token] || [],
      })),
    })),
    roles: {
      senderLabel: 'for',
      receiverLabel: 'on',
    },
    receiptId: event.receiptId ?? '',
  };
}
