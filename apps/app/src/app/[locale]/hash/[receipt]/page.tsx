import { redirect } from 'next/navigation';

import { getRequest } from '@/utils/app/api';
import { getReceipt, getTxn } from '@/utils/app/rpc';
import { networkId } from '@/utils/app/config';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FileSlash from '@/components/app/Icons/FileSlash';

export default async function ReceiptPage(props: {
  params: Promise<{ receipt: string }>;
}) {
  const params = await props.params;

  const { receipt } = params;

  const receiptRpc =
    networkId === 'mainnet'
      ? `https://beta.rpc.mainnet.near.org`
      : `https://beta.rpc.testnet.near.org`;

  const resp = await getRequest(`v1/search/receipts?keyword=${receipt}`);
  let txn = resp?.receipts?.[0]?.originated_from_transaction_hash;

  if (!txn) {
    const resp = await getRequest(`v1/search/txns?keyword=${receipt}`);
    txn = resp?.txns?.[0]?.transaction_hash;
    if (!txn) {
      try {
        const rpcResponseReceipt = await getReceipt(receiptRpc, receipt);
        if (rpcResponseReceipt) {
          txn = rpcResponseReceipt?.parent_transaction_hash;
        } else {
          const rpcResponseTxn = await getTxn(receipt);
          if (rpcResponseTxn) {
            if (rpcResponseTxn?.final_execution_status !== 'NONE') {
              txn = rpcResponseTxn?.transaction?.hash;
            }
          }
        }
      } catch (Error) {
        console.error('rpc error on fetching txn hash', Error);
      }
    }
  }
  if (txn) {
    redirect(`/txns/${txn}`);
  }

  return (
    <>
      <div className="container-xxl mx-auto px-5 pt-10">
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 px-5">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
            <ErrorMessage
              icons={<FileSlash />}
              message="Sorry, we are unable to locate this receipt hash. Please try again later."
              mutedText={receipt || ''}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
