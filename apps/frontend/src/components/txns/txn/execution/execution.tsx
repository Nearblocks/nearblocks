'use client';

import type { TxnReceipt } from 'nb-schemas';

import { useHashScroll } from '@/hooks/use-hash-scroll';

import { RpcContext } from './context';
import { RawTransactionData } from './raw';
import { ReceiptTree } from './tree';

type Props = {
  nearPrice?: null | string;
  receipts: TxnReceipt;
  tid?: string;
};

export const ExecutionPlan = ({ nearPrice, receipts, tid }: Props) => {
  useHashScroll(true);

  return (
    <RpcContext.Provider value={{ nearPrice }}>
      <ReceiptTree depth={0} isFirst receipt={receipts} />
      {tid && (
        <RawTransactionData
          senderAccountId={receipts.predecessor_account_id}
          tid={tid}
        />
      )}
    </RpcContext.Provider>
  );
};
