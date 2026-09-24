import { redirect } from 'next/navigation';
import { getRequest } from '@/utils/app/api';
import ReceiptRedirect from '@/components/app/Transactions/ReceiptRedirect';

export default async function ReceiptPage(props: {
  params: Promise<{ receipt: string }>;
}) {
  const params = await props.params;
  const { receipt } = params;

  const receiptSearch = await getRequest(
    `v1/search/receipts?keyword=${receipt}`,
  );
  let txn = receiptSearch?.receipts?.[0]?.originated_from_transaction_hash;

  if (!txn) {
    const txnSearch = await getRequest(`v1/search/txns?keyword=${receipt}`);
    txn = txnSearch?.txns?.[0]?.transaction_hash;
  }

  if (txn) {
    redirect(`/txns/${txn}`);
  }

  return <ReceiptRedirect receipt={receipt} />;
}
