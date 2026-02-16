'use client';

import { useState } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { useTxnStatus } from '@/hooks/use-rpc';

import { RpcContext } from './context';
import { ReceiptTree } from './receipt-tree';

type Props = {
  receipts: TxnReceipt;
  txnHash?: string;
};

export const ExecutionPlan = ({ receipts, txnHash }: Props) => {
  const [rpcEnabled, setRpcEnabled] = useState(false);

  const { data: rpcData, isLoading: rpcLoading } = useTxnStatus(
    rpcEnabled && txnHash
      ? {
          senderAccountId: receipts.predecessor_account_id,
          txHash: txnHash,
        }
      : null,
  );

  return (
    <RpcContext.Provider
      value={{
        enableRpc: () => setRpcEnabled(true),
        rpcData,
        rpcLoading,
      }}
    >
      <ReceiptTree depth={0} isFirst receipt={receipts} />
    </RpcContext.Provider>
  );
};
