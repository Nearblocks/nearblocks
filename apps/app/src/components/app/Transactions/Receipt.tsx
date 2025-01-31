'use client';

import { RPCTransactionInfo, TransactionInfo } from '@/utils/types';
import { ReceiptsPropsInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import FaHourglassStart from '../Icons/FaHourglassStart';
import FileSlash from '../Icons/FileSlash';
import ReceiptRow from './Receipts/ReceiptRow';

interface Props {
  block: { height: string };
  hash: string;
  receipt: null | ReceiptsPropsInfo;
  rpcTxn: RPCTransactionInfo;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  txn: TransactionInfo;
}

const Receipt = (props: Props) => {
  const { block, hash, receipt, statsData, txn } = props;

  const txnsPending = txn?.outcomes?.status === null;

  return (
    <>
      {!txn ? (
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
            <ErrorMessage
              icons={<FileSlash />}
              message="Sorry, we are unable to locate this transaction hash. Please try using a
        different RPC."
              mutedText={hash || ''}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-nearblue-600 dark:text-neargray-10 dark:divide-black-200 divide-solid divide-gray-200 divide-y">
          {txnsPending ? (
            <div className="flex justify-center text-base p-24">
              <div className="text-center">
                <div className="inline-flex items-center text-base rounded bg-yellow-50 dark:bg-black-200 text-yellow-500 animate-spin my-3">
                  <FaHourglassStart className="w-5 !h-5" />
                </div>

                <h1 className="text-lg text-nearblue-600 dark:text-neargray-10">
                  This transaction is pending confirmation.
                </h1>
              </div>
            </div>
          ) : (
            <ReceiptRow block={block} receipt={receipt} statsData={statsData} />
          )}
        </div>
      )}
    </>
  );
};
export default Receipt;
