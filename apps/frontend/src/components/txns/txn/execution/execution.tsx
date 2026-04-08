'use client';

import { useState } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { useHashScroll } from '@/hooks/use-hash-scroll';
import { useTxnStatus } from '@/hooks/use-rpc';

import { RpcContext } from './context';
import { ReceiptTree } from './tree';

type Props = {
  nearPrice?: null | string;
  receipts: TxnReceipt;
  tid?: string;
};

export const ExecutionPlan = ({ nearPrice, receipts, tid }: Props) => {
  useHashScroll(true);
  const [rpcEnabled, setRpcEnabled] = useState(false);

  const { data: rpcData, isLoading: rpcLoading } = useTxnStatus(
    rpcEnabled && tid
      ? {
          senderAccountId: receipts.predecessor_account_id,
          txHash: tid,
        }
      : null,
  );

  return (
    <RpcContext.Provider
      value={{
        enableRpc: () => setRpcEnabled(true),
        nearPrice,
        rpcData,
        rpcLoading,
      }}
    >
      <ReceiptTree depth={0} isFirst receipt={receipts} />
    </RpcContext.Provider>
  );
};
