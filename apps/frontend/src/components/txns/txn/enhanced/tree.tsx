'use client';

import type { TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { AccountLink } from '@/components/link';

import { ActionCard, ReceiptExpandedSection } from './action';

type Props = {
  expandedIds: Set<string>;
  fellowReceipts?: TxnReceipt[];
  isRoot?: boolean;
  receipt: TxnReceipt;
  toggle: (key: string) => void;
  wrapperClassName?: string;
};

export const EnhancedTree = ({
  expandedIds,
  fellowReceipts = [],
  isRoot = false,
  receipt,
  toggle,
  wrapperClassName = '',
}: Props) => {
  const filteredChildren = receipt.receipts.filter(
    (r) => r.predecessor_account_id !== 'system',
  );

  const lastChild = filteredChildren.at(-1);
  const otherChildren = filteredChildren.slice(0, -1);

  const lastFellow = fellowReceipts.at(-1);
  const remainingFellows = fellowReceipts.slice(0, -1);

  const actions =
    receipt.actions[0]?.action === ActionKind.DELEGATE_ACTION
      ? [receipt.actions[0]]
      : receipt.actions;

  const key = receipt.receipt_id;
  const isExpanded = expandedIds.has(key);

  const baseWrapperClassName = isRoot
    ? 'pl-0 border-transparent'
    : 'border-link pl-4 md:pl-8';

  return (
    <>
      <div className={`${baseWrapperClassName} ${wrapperClassName}`}>
        {isRoot && (
          <div className="flex items-center gap-2 py-1">
            <span className="bg-border size-4 shrink-0 rounded-full" />
            <AccountLink
              account={receipt.predecessor_account_id}
              textClassName="max-w-60 text-body-sm font-medium"
            />
          </div>
        )}

        {lastFellow && (
          <EnhancedTree
            expandedIds={expandedIds}
            fellowReceipts={remainingFellows}
            receipt={lastFellow}
            toggle={toggle}
            wrapperClassName="ml-2 border-l pb-4 !mt-0"
          />
        )}

        <div className="border-link ml-2 border-l py-2 pl-6">
          <div className="flex flex-wrap gap-1">
            {actions.map((action, i) => (
              <ActionCard
                action={action}
                expanded={isExpanded}
                key={i}
                receipt={receipt}
                toggle={() => toggle(key)}
              />
            ))}
          </div>
          {isExpanded && (
            <ReceiptExpandedSection actions={actions} receipt={receipt} />
          )}
        </div>

        <div className="relative flex items-center gap-2 py-1">
          <div className="border-link absolute -top-1.5 left-[5.5px] h-1.5 w-1.5 -rotate-45 border-b border-l" />
          <span className="bg-border size-4 shrink-0 rounded-full" />
          <AccountLink
            account={receipt.receiver_account_id}
            textClassName="max-w-60 text-body-sm font-medium"
          />
        </div>
      </div>

      {lastChild && (
        <EnhancedTree
          expandedIds={expandedIds}
          fellowReceipts={otherChildren}
          receipt={lastChild}
          toggle={toggle}
          wrapperClassName="!border-transparent !pl-0"
        />
      )}
    </>
  );
};
