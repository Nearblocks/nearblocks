import { notFound, redirect } from 'next/navigation';

import { getRequest } from '@/utils/app/api';

export default async function ReceiptPage(props: {
  params: Promise<{ receipt: string }>;
}) {
  const params = await props.params;

  const { receipt } = params;

  const resp = await getRequest(`search/receipts?keyword=${receipt}`);
  const txn = resp?.receipts?.[0]?.originated_from_transaction_hash;

  if (txn) {
    redirect(`/txns/${txn}`);
  }

  notFound();
}
