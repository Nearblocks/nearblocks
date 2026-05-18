'use client';

import type { TxnReceipt } from 'nb-schemas';

import { useHashScroll } from '@/hooks/use-hash-scroll';

import { RpcContext } from './context';
import { ReceiptTree } from './tree';

type Props = {
  nearPrice?: null | string;
  receipts: TxnReceipt;
};

export const ExecutionPlan = ({ nearPrice, receipts }: Props) => {
  useHashScroll(true);

  return (
    <RpcContext.Provider value={{ nearPrice }}>
      <ReceiptTree depth={0} isFirst receipt={receipts} />
    </RpcContext.Provider>
  );
};
