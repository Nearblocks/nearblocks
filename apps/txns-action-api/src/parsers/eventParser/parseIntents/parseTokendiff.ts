interface TokenDiff {
  account_id: string;
  diff: Record<string, string>;
  intent_hash?: string;
}

export async function parseTokenDiff({
  event,
  data,
  meta,
}: {
  event: any;
  data: TokenDiff[] | TokenDiff;
  meta: any;
}) {
  const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

  const swaps = [];

  for (const { account_id, diff, intent_hash } of normalizedData) {
    const sent = [];
    const received = [];

    for (const [token, rawAmount] of Object.entries(diff || {})) {
      const amount = BigInt(rawAmount);
      const baseToken = token.includes(':') ? token.split(':')[1] : token;

      if (amount > 0n) {
        received.push({
          token: baseToken,
          amount: amount.toString(),
          meta: meta?.[baseToken] ?? {},
        });
      } else if (amount < 0n) {
        sent.push({
          token: baseToken,
          amount: (-amount).toString(),
          meta: meta?.[baseToken] ?? {},
        });
      }
    }

    if (sent.length && received.length) {
      swaps.push({
        type: 'Swap',
        contract: event?.contract ?? 'intents.near',
        swaps: [{ accountId: account_id, sent, received }],
        roles: {
          senderLabel: 'For',
          receiverLabel: 'On',
        },
        receiptId: event?.receiptId ?? '',
        intentHash: intent_hash,
      });
    }
  }

  return swaps.length > 0 ? swaps : null;
}
