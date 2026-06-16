'use client';

import type { TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { cn } from '@/lib/utils';

import { argsRecord } from '../actions/action';
import { ReceiptIcon } from '../actions/icon';
import { actionVariant } from '../enhanced/action';

type Props = {
  isRoot?: boolean;
  receipt: TxnReceipt;
  selectedId: string;
  toggle: (id: string) => void;
};

const actionLabel = (receipt: TxnReceipt): string => {
  const action = receipt.actions[0];
  if (!action) return ActionKind.UNKNOWN;
  if (action.action === ActionKind.FUNCTION_CALL) {
    const args = argsRecord(action.args);
    if ('method_name' in args) return String(args.method_name);
  }
  return action.action;
};

const TreeItem = ({ receipt, selectedId, toggle }: Omit<Props, 'isRoot'>) => {
  const action = receipt.actions[0]?.action ?? ActionKind.UNKNOWN;
  const isSelected = receipt.receipt_id === selectedId;
  const isFail = receipt.outcome.status === false;
  const variant = actionVariant(action);

  return (
    <li>
      <div
        className={cn(
          'inline-flex max-w-60 cursor-pointer items-center gap-2 rounded-md border-2 px-2 py-1 transition-colors',
          variant.bg,
          isSelected
            ? 'border-link'
            : 'hover:border-link/50 border-transparent',
        )}
        onClick={() => toggle(receipt.receipt_id)}
        role="button"
        tabIndex={0}
      >
        <ReceiptIcon action={action} className="size-3.5 shrink-0" />
        <span className={cn('text-body-sm truncate', variant.color)}>
          {actionLabel(receipt)}
        </span>
        {isFail && (
          <span className="bg-destructive/10 text-destructive shrink-0 rounded px-1 py-0.5 text-xs">
            Fail
          </span>
        )}
      </div>
      {receipt.receipts.length > 0 && (
        <ul>
          {receipt.receipts.map((child) => (
            <TreeItem
              key={child.receipt_id}
              receipt={child}
              selectedId={selectedId}
              toggle={toggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const TreeNode = ({ receipt, selectedId, toggle }: Props) => (
  <ul className="receipt-tree">
    <TreeItem receipt={receipt} selectedId={selectedId} toggle={toggle} />
  </ul>
);
