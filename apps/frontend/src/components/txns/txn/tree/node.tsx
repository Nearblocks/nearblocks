'use client';

import type { TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

import { argsRecord } from '../actions/action';
import { ReceiptIcon } from '../actions/icon';
import { actionVariant } from '../enhanced/action';

type ItemProps = {
  receipt: TxnReceipt;
  selectedId: string;
  toggle: (id: string) => void;
};

type Props = {
  isRoot?: boolean;
  loading?: boolean;
  receipt?: TxnReceipt;
  selectedId?: string;
  toggle?: (id: string) => void;
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

const TreeItem = ({ receipt, selectedId, toggle }: ItemProps) => {
  const action = receipt.actions[0]?.action ?? ActionKind.UNKNOWN;
  const isSelected = receipt.receipt_id === selectedId;
  const isFail = receipt.outcome.status === false;
  const variant = actionVariant(action);

  return (
    <li>
      <div
        className={cn(
          'inline-flex max-w-60 cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors',
          variant.bg,
          isSelected
            ? 'outline-link outline-2'
            : 'hover:outline-link/50 hover:outline-2',
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

const skeletonNode = (
  bg: string,
  labelWidth: string,
  children?: React.ReactNode,
) => (
  <li>
    <div
      className={cn(
        'inline-flex max-w-60 items-center gap-2 rounded-md px-2 py-1',
        bg,
      )}
    >
      <Skeleton className="size-3.5 shrink-0 rounded-full" />
      <Skeleton className={cn('h-[1.375rem]', labelWidth)} />
    </div>
    {children && <ul>{children}</ul>}
  </li>
);

export const TreeNode = ({ loading, receipt, selectedId, toggle }: Props) => {
  if (loading) {
    return (
      <ul className="receipt-tree">
        {skeletonNode(
          'bg-blue-background',
          'w-28',
          <>
            {skeletonNode(
              'bg-amber-background',
              'w-20',
              skeletonNode('bg-lime-background', 'w-16'),
            )}
            {skeletonNode('bg-gray-background', 'w-24')}
          </>,
        )}
      </ul>
    );
  }

  return (
    <ul className="receipt-tree">
      <TreeItem receipt={receipt!} selectedId={selectedId!} toggle={toggle!} />
    </ul>
  );
};
