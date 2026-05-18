'use client';

import { useMemo, useState } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';

import { RpcContext } from '../execution/context';
import { EnhancedTree } from './tree';

type Props = {
  nearPrice?: null | string;
  receipts: TxnReceipt;
};

export const EnhancedPlan = ({ nearPrice, receipts }: Props) => {
  const { t } = useLocale('txns');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

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
    <RpcContext.Provider value={{ nearPrice }}>
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
