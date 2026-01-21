import { TransactionLog } from 'src/utils/types';

interface TokenDiffEvent {
  old_owner_id: string;
  new_owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface TransferInput {
  event: TransactionLog;
  data: TokenDiffEvent[] | TokenDiffEvent;
  meta: any;
}

export async function parseTransfer({ event, data, meta }: TransferInput) {
  const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

  const userSwaps: Record<
    string,
    {
      sent: { token: string; amount: string }[];
      received: { token: string; amount: string }[];
    }
  > = {};

  for (const entry of normalizedData) {
    const { old_owner_id, new_owner_id, token_ids, amounts } = entry;

    if (!Array.isArray(token_ids) || !Array.isArray(amounts)) {
      continue;
    }

    for (let i = 0; i < token_ids.length; i++) {
      const tokenIdFull = token_ids[i];
      const token = tokenIdFull.includes(':')
        ? tokenIdFull.split(':')[1]
        : tokenIdFull;
      const amount = amounts[i];

      if (!userSwaps[old_owner_id]) {
        userSwaps[old_owner_id] = { sent: [], received: [] };
      }
      userSwaps[old_owner_id].sent.push({ token, amount });

      if (!userSwaps[new_owner_id]) {
        userSwaps[new_owner_id] = { sent: [], received: [] };
      }
      userSwaps[new_owner_id].received.push({ token, amount });
    }
  }

  const transferChain: {
    accountId: string;
    sent: { token: string; amount: string; meta: any };
    received: { token: string; amount: string; meta: any };
  }[] = [];

  for (const [accountId, { sent, received }] of Object.entries(userSwaps)) {
    const minLength = Math.min(sent.length, received.length);

    for (let i = 0; i < minLength; i++) {
      const s = sent[i];
      const r = received[i];
      transferChain.push({
        accountId,
        sent: { ...s, meta: meta?.[s.token] || {} },
        received: { ...r, meta: meta?.[r.token] || {} },
      });
    }
  }

  if (transferChain.length === 0) {
    return null;
  }

  const swaps = transferChain.map((swap) => ({
    type: 'Swap',
    contract: event?.contract ?? 'intents.near',
    swaps: [
      {
        accountId: swap.accountId,
        sent: [swap.sent],
        received: [swap.received],
      },
    ],
    roles: {
      senderLabel: 'For',
      receiverLabel: 'On',
    },
    receiptId: event?.receiptId ?? '',
  }));

  return swaps;
}
