import { notFound, redirect } from 'next/navigation';

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

  const resp = await getRequest(`search/receipts?keyword=${receipt}`);
  let txn = resp?.receipts?.[0]?.originated_from_transaction_hash;

  if (!txn) {
    try {
      const rpcResponse = await getReceipt(receiptRpc, receipt);
      if (rpcResponse) {
        txn = rpcResponse?.parent_transaction_hash;
      }
    } catch (rpcError) {
      console.log('RPC call failed:', rpcError);
      return {
        notFound: true,
      };
    }
  }

  if (txn) {
    redirect(`/txns/${txn}`);
  }

  notFound();
}
