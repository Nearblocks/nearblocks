import { useEffect, useState } from 'react';

import { TxnReceiptSkeleton } from '@/components/Skeletons/Txn';
import TxnActions from '@/components/Transaction/TxnActions';
import TxnAddress from '@/components/Transaction/TxnAddress';

interface TxnReceiptProps {
  className?: string;
  conversion: boolean;
  expand: boolean;
  outgoingReceipts: any[];
  receipt: any;
}

const TxnReceipt = ({
  className,
  conversion,
  expand,
  outgoingReceipts,
  receipt,
}: TxnReceiptProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(expand);
  }, [expand]);

  if (!receipt || !('outcome' in receipt)) {
    return <TxnReceiptSkeleton />;
  }

  const remainingOutgoingReceipts = outgoingReceipts.slice(0, -1);
  const lastOutgoingReceipt = outgoingReceipts.at(-1);

  const filterRefundReceipts = receipt.outcome.nestedReceipts.filter(
    (nestedReceipt: any) =>
      'outcome' in nestedReceipt && nestedReceipt.predecessorId !== 'system',
  );
  const nonRefundReceipts = filterRefundReceipts.slice(0, -1);
  const lastNonRefundReceipt = filterRefundReceipts.at(-1);

  return (
    <div className={className}>
      {conversion && <TxnAddress address={receipt.predecessorId} />}

      {lastOutgoingReceipt && (
        <TxnReceipt
          className="ml-2 pl-4 border-l border-border-body"
          conversion={false}
          expand={expand}
          outgoingReceipts={remainingOutgoingReceipts}
          receipt={lastOutgoingReceipt}
        />
      )}

      <div className="relative ml-2 mb-3 py-3 px-4">
        <div className="arrow absolute h-full left-0 top-0 border-l border-border-body" />
        <TxnActions
          actions={receipt.actions}
          open={open}
          receipt={receipt}
          setOpen={setOpen}
        />
      </div>
      <TxnAddress address={receipt.receiverId} />

      {lastNonRefundReceipt && (
        <TxnReceipt
          conversion={false}
          expand={expand}
          outgoingReceipts={nonRefundReceipts}
          receipt={lastNonRefundReceipt}
        />
      )}
    </div>
  );
};

export default TxnReceipt;
