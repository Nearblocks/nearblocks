'use client';

import { useMemo, useState } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { useTxnStatus } from '@/hooks/use-rpc';
import { Button } from '@/ui/button';

import { RpcContext } from '../execution/context';
import { EnhancedTree } from './tree';

type Props = {
  receipts: TxnReceipt;
  tid?: string;
};

export const EnhancedPlan = ({ receipts, tid }: Props) => {
  const { t } = useLocale('txns');
  const [rpcEnabled, setRpcEnabled] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const { data: rpcData, isLoading: rpcLoading } = useTxnStatus(
    rpcEnabled && tid
      ? {
          senderAccountId: receipts.predecessor_account_id,
          txHash: tid,
        }
      : null,
  );

  const allKeys = useMemo(() => {
    const keys: string[] = [];
    const collect = (r: TxnReceipt) => {
      if (r.predecessor_account_id !== 'system') {
        keys.push(r.receipt_id);
      }
      r.receipts.forEach(collect);
    };
    collect(receipts);
    return keys;
  }, [receipts]);

  const isAllExpanded =
    expandedIds.size > 0 && expandedIds.size >= allKeys.length;

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(allKeys));
    }
  };

  const toggle = (key: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <RpcContext.Provider
      value={{
        enableRpc: () => setRpcEnabled(true),
        rpcData,
        rpcLoading,
      }}
    >
      <div className="flex w-full flex-col">
        <div className="hidden justify-end px-4 md:flex md:px-8">
          <Button
            className="absolute"
            onClick={toggleAll}
            size="xs"
            variant="outline"
          >
            {isAllExpanded
              ? t('enhanced.collapseAll')
              : t('enhanced.expandAll')}
            <span className="ml-1">{isAllExpanded ? '-' : '+'}</span>
          </Button>
        </div>
        <div className="overflow-auto px-4 md:px-8">
          <EnhancedTree
            expandedIds={expandedIds}
            isRoot
            receipt={receipts}
            toggle={toggle}
          />
        </div>
      </div>
    </RpcContext.Provider>
  );
};
