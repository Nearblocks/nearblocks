import { TransactionLog } from 'src/utils/types';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface BurnInput {
  event: TransactionLog;
  data: DataItem[];
  meta: any;
}

export function parseBurn({ event, data, meta }: BurnInput) {
  return {
    label: 'Withdraw',
    type: 'burn',
    contract: 'intents.near',
    receiver: data[0]?.owner_id || '',
    roles: {
      senderLabel: 'From',
      receiverLabel: '',
    },
    tokens: data
      .map((item) => {
        return item.token_ids.map((tokenId, idx) => {
          const contract = tokenId.split(':')[1];
          return {
            token: contract,
            amount: item.amounts[idx],
            meta: meta?.[contract] || null,
          };
        });
      })
      .flat(),
    receiptId: event.receiptId ?? '',
  };
}
