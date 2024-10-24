import { getRequest } from '@/utils/app/api';
import { notFound, redirect } from 'next/navigation';

export default async function ReceiptPage({
  params: { receipt },
}: {
  params: { receipt: string };
}) {
  const resp = await getRequest(`search/receipts?keyword=${receipt}`);
  const txn = resp?.receipts?.[0]?.originated_from_transaction_hash;

  if (txn) {
    redirect(`/txns/${txn}`);
  }

  notFound();
}
