'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Copy } from '@/components/copy';
import { JsonTree } from '@/components/json-tree';
import { useTxnStatus } from '@/hooks/use-rpc';

type Props = {
  senderAccountId: string;
  tid: string;
};

export const RawTransactionData = ({ senderAccountId, tid }: Props) => {
  const [open, setOpen] = useState(false);
  const { data, error, isLoading } = useTxnStatus(
    open ? { senderAccountId, txHash: tid } : null,
  );

  const code = data ? JSON.stringify(data, null, 2) : '';

  return (
    <div className="mt-6 overflow-hidden rounded border bg-(--prism-bg)">
      <div className="bg-card/40 flex items-center justify-between gap-2 border-b px-3 py-2">
        <button
          className="text-foreground hover:text-foreground text-body-sm inline-flex items-center gap-1 font-medium"
          onClick={() => setOpen((p) => !p)}
          type="button"
        >
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          Raw Transaction Data
        </button>
        {open && data && <Copy className="text-muted-foreground" text={code} />}
      </div>
      {open && (
        <div className="scroll-overlay max-h-150 min-h-12 overflow-auto">
          {isLoading ? (
            <p className="text-muted-foreground text-body-sm px-4 py-3">
              Loading raw transaction data…
            </p>
          ) : error ? (
            <p className="text-red-foreground text-body-sm px-4 py-3">
              Failed to load raw transaction data.
            </p>
          ) : data ? (
            <JsonTree value={data as never} />
          ) : null}
        </div>
      )}
    </div>
  );
};
