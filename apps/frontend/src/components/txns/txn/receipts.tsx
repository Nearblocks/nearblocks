'use client';

import { useParams } from 'next/navigation';
import { use, useMemo } from 'react';

import type { ActionReceipt, TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink } from '@/components/link';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { NearCircle } from '@/icons/near-circle';
import { gasFormat, nearFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';

type ReceiptRow = {
  action: ActionReceipt;
  gas_burnt: string | undefined;
  index: number;
  outcome_status: boolean | undefined;
  predecessor_account_id: string;
  receipt_id: string;
  receiver_account_id: string;
  tokens_burnt: string | undefined;
};

const flattenReceipts = (receipt: TxnReceipt): ReceiptRow[] => {
  const rows: ReceiptRow[] = [];
  let index = 0;

  const walk = (r: TxnReceipt) => {
    const actions =
      r.actions[0]?.action === ActionKind.DELEGATE_ACTION
        ? [r.actions[0]]
        : r.actions;

    for (const action of actions) {
      rows.push({
        action,
        gas_burnt: r.outcome.gas_burnt,
        index: index++,
        outcome_status: r.outcome.status,
        predecessor_account_id: r.predecessor_account_id,
        receipt_id: r.receipt_id,
        receiver_account_id: r.receiver_account_id,
        tokens_burnt: r.outcome.tokens_burnt,
      });
    }

    for (const child of r.receipts) {
      walk(child);
    }
  };

  walk(receipt);
  return rows;
};

const actionDeposit = (action: ActionReceipt): string | undefined => {
  if (
    !action.args ||
    typeof action.args !== 'object' ||
    Array.isArray(action.args)
  )
    return undefined;
  const args = action.args as Record<string, unknown>;
  return typeof args.deposit === 'string' ? args.deposit : undefined;
};

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
};

export const ReceiptsSummary = ({ loading, receiptsPromise }: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const { txn } = useParams<{ txn: string }>();

  const rows = useMemo(() => {
    if (!receipts) return [];
    return flattenReceipts(receipts);
  }, [receipts]);

  const columns: DataTableColumnDef<ReceiptRow>[] = [
    {
      cell: (row) => <TxnStatusIcon status={row.outcome_status} />,
      className: 'w-5',
      header: '',
      id: 'status',
    },
    {
      cell: (row) => (
        <a
          className="text-link"
          href={`/txns/${txn}/execution#${row.receipt_id}`}
        >
          <Truncate>
            <TruncateText text={row.receipt_id} />
            <TruncateCopy text={row.receipt_id} />
          </Truncate>
        </a>
      ),
      header: 'Receipt',
      id: 'receipt_id',
    },
    {
      cell: (row) => (
        <Badge variant="blue">
          <Truncate>
            <TruncateText
              className="max-w-30"
              text={row.action.method ?? row.action.action}
            />
          </Truncate>
        </Badge>
      ),
      header: 'Method',
      id: 'method',
    },
    {
      cell: (row) => <AccountLink account={row.predecessor_account_id} />,
      header: 'From',
      id: 'from',
    },
    {
      cell: () => <TxnDirectionIcon />,
      cellClassName: 'px-0',
      className: 'w-6',
      header: '',
      id: 'direction',
    },
    {
      cell: (row) => <AccountLink account={row.receiver_account_id} />,
      header: 'To',
      id: 'to',
    },
    {
      cell: (row) => {
        const deposit = actionDeposit(row.action);
        return (
          <span className="flex items-center gap-1">
            <NearCircle className="size-4" />
            {nearFormat(deposit ?? '0')}
          </span>
        );
      },
      header: 'Deposit Value',
      id: 'deposit',
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-1">
          {row.gas_burnt && `${gasFormat(row.gas_burnt)} Tgas`}
          {row.gas_burnt && row.tokens_burnt && (
            <span className="text-muted-foreground">|</span>
          )}
          <NearCircle className="size-4" />
          {row.tokens_burnt && nearFormat(row.tokens_burnt)}
        </span>
      ),
      header: 'Burnt Gas & Tokens',
      id: 'burnt',
    },
  ];

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={loading || !receipts ? undefined : rows}
          emptyMessage="No receipts found"
          getRowKey={(row) => `${row.receipt_id}-${row.index}`}
          loading={loading || !receipts}
          skeletonRows={5}
        />
      </CardContent>
    </Card>
  );
};
