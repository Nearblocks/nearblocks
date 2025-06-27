import { ParsedLog } from 'src/utils/app/config';
import { TransactionLog } from 'src/utils/types';

interface MintInput {
  event: TransactionLog;
  data: {
    owner_id: string;
    token_ids: string[];
    amounts: string[];
  }[];
  parsedActionLogs?: any[];
  meta: any;
}

export async function parseMint({
  event,
  data,
  parsedActionLogs,
  meta,
}: MintInput) {
  const receiverId = data[0]?.owner_id;
  const token = data[0]?.token_ids?.[0]?.split(':')[1];

  let sender = '';
  let receiver = '';

  if (parsedActionLogs?.length && receiverId) {
    const relevantLog = parsedActionLogs.find(
      (log) => log?.parsedArgs?.sender_id && log?.parsedArgs?.receiver_id,
    );

    if (relevantLog) {
      sender = relevantLog?.parsedArgs?.sender_id;
      receiver = relevantLog?.parsedArgs?.receiver_id;
    }
  }

  const extractMeta = (tokenId: string) => {
    const value = meta?.[tokenId];
    if (typeof value === 'object' && value !== null) {
      return Array.isArray(value) ? value[0] ?? null : value;
    }
    return null;
  };

  return {
    label: 'Deposit',
    type: 'mint',
    contract: 'intents.near',
    receiverId,
    receiver,
    sender,
    roles: {
      senderLabel: 'by',
      receiverLabel: 'On',
    },
    tokens: data
      .map(({ token_ids, amounts }) =>
        token_ids.map((t, idx) => ({
          token: t.split(':')[1],
          amount: amounts[idx],
          meta: extractMeta(t.split(':')[1]),
        })),
      )
      .flat(),
    receiptId: event.receiptId ?? '',
  };
}
