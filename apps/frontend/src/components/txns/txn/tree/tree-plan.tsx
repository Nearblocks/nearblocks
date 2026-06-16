'use client';

import { useMemo, useRef, useState } from 'react';

import type { TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { useTxnStatus } from '@/hooks/use-rpc';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

import { ReceiptExpandedSection } from '../enhanced/action';
import { RpcContext } from '../execution/context';
import { TreeNode } from './node';

type Props = {
  nearPrice?: null | string;
  receipts: TxnReceipt;
  tid?: string;
};

const buildMap = (
  receipt: TxnReceipt,
  into = new Map<string, TxnReceipt>(),
): Map<string, TxnReceipt> => {
  into.set(receipt.receipt_id, receipt);
  for (const child of receipt.receipts ?? []) buildMap(child, into);
  return into;
};

export const TreePlan = ({ nearPrice, receipts, tid }: Props) => {
  const [rpcEnabled, setRpcEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState(receipts.receipt_id);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: rpcData, isLoading: rpcLoading } = useTxnStatus(
    rpcEnabled && tid
      ? { senderAccountId: receipts.predecessor_account_id, txHash: tid }
      : null,
  );

  const receiptMap = useMemo(() => buildMap(receipts), [receipts]);
  const selected = receiptMap.get(selectedId) ?? receipts;
  const selectedActions =
    selected.actions[0]?.action === ActionKind.DELEGATE_ACTION
      ? [selected.actions[0]]
      : selected.actions;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (window.innerWidth < 768) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <RpcContext.Provider
      value={{
        enableRpc: () => setRpcEnabled(true),
        nearPrice,
        rpcData,
        rpcLoading,
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row">
        <ScrollArea className="self-start md:sticky md:top-2 md:max-h-[80vh] md:w-1/2 lg:w-7/12">
          <div className="px-3 pt-2 pb-6">
            <TreeNode
              isRoot
              receipt={receipts}
              selectedId={selectedId}
              toggle={handleSelect}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div
          className="px-3 md:w-1/2 md:self-start md:px-0 lg:w-5/12"
          data-stacked="true"
          ref={panelRef}
        >
          <ReceiptExpandedSection
            actions={selectedActions}
            receipt={selected}
          />
        </div>
      </div>
    </RpcContext.Provider>
  );
};
