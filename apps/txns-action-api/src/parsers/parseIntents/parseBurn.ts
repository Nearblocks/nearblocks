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
    type: 'burn',
    contract: 'intents.near',
    receiverId: data[0]?.owner_id || '',
    tokens: data
      .map((item) => {
        return item.token_ids.map((tokenId, idx) => {
          const contract = tokenId.split(':')[1];
          return {
            token: contract,
            amount: item.amounts[idx],
            meta: meta.find((m: any) => m.contractId === contract) || null,
          };
        });
      })
      .flat(),
    receiptId: event.receiptId ?? '',
  };
}
