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
    tokens: data.map((item) => {
      const tokenId = item.token_ids[0];
      const amount = item.amounts[0];
      const contract = tokenId.split(':')[1];

      const matchedMeta = Array.isArray(meta)
        ? meta.filter((m: any) => m.contractId === contract)
        : meta?.[contract] || null;

      return {
        token: contract,
        amount,
        meta: matchedMeta,
      };
    }),
    receiptId: event.receiptId ?? '',
  };
}
