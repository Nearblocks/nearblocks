import { redirect } from 'next/navigation';

import { getRequest } from '@/utils/app/api';
import { getReceipt } from '@/utils/app/rpc';
import { networkId } from '@/utils/app/config';

export default async function ReceiptPage(props: {
  params: Promise<{ receipt: string }>;
}) {
  const params = await props.params;

  const { receipt } = params;

  const receiptRpc =
    networkId === 'mainnet'
      ? `https://beta.rpc.mainnet.near.org`
      : `https://beta.rpc.testnet.near.org')`;

  const resp = await getRequest(`v1/search/receipts?keyword=${receipt}`);
  let txn = resp?.receipts?.[0]?.originated_from_transaction_hash;

  if (!txn) {
    try {
      const rpcResponse = await getReceipt(receiptRpc, receipt);
      if (rpcResponse) {
        txn = rpcResponse?.parent_transaction_hash;
      } else {
        throw new Error('something went wrong');
      }
    } catch (rpcError) {
      console.log('RPC call failed:', rpcError);
      throw new Error('something went wrong');
    }
  }

  if (txn) {
    redirect(`/txns/${txn}`);
  }
}
