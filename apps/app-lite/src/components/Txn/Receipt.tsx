import { useEffect, useState } from 'react';

import Skeleton from '@/components/Skeleton';
import type {
  FailedToFindReceipt,
  NestedReceiptWithOutcome,
} from '@/types/near';

import Actions from './Actions';
import Address from './Address';

type ReceiptProps = {
  className?: string;
  convertion: boolean;
  expand: boolean;
  outgoingReceipts: (FailedToFindReceipt | NestedReceiptWithOutcome)[];
  receipt: FailedToFindReceipt | NestedReceiptWithOutcome;
};

const Receipt = ({
  className,
  convertion,
  expand,
  outgoingReceipts,
  receipt,
}: ReceiptProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(expand);
  }, [expand]);

  if (!('outcome' in receipt)) {
    return (
      <>
        <Address />
        <div className="relative ml-2 mb-3 py-3 px-4">
          <div className="arrow absolute h-full left-0 top-0 border-l border-border-body" />
          <div className="space-y-2">
            <div>
              <Skeleton className="block h-7 w-28" loading>
                <button className="text-sm text-black rounded py-1 px-3 bg-bg-function">
                  &nbsp;
                </button>
              </Skeleton>
              <span className="font-semibold text-xs" />
            </div>
          </div>
        </div>
        <Address />
      </>
    );
  }

  const remainingOutgoingReceipts = outgoingReceipts.slice(0, -1);
  const lastOutgoingReceipt = outgoingReceipts.at(-1);
  const filterRefundReceipts = receipt.outcome.nestedReceipts.filter(
    (nestedReceipt) =>
      'outcome' in nestedReceipt && nestedReceipt.predecessorId !== 'system',
  );
  const nonRefundReceipts = filterRefundReceipts.slice(0, -1);
  const lastNonRefundReceipt = filterRefundReceipts.at(-1);

  return (
    <div className={className}>
      {convertion && <Address address={receipt.predecessorId} />}
      {lastOutgoingReceipt && (
        <Receipt
          className="ml-2 pl-4 border-l border-border-body"
          convertion={false}
          expand={expand}
          outgoingReceipts={remainingOutgoingReceipts}
          receipt={lastOutgoingReceipt}
        />
      )}
      <div className="relative ml-2 mb-3 py-3 px-4">
        <div className="arrow absolute h-full left-0 top-0 border-l border-border-body" />
        <Actions open={open} receipt={receipt} setOpen={setOpen} />
      </div>
      <Address address={receipt.receiverId} />
      {lastNonRefundReceipt && (
        <Receipt
          convertion={false}
          expand={expand}
          outgoingReceipts={nonRefundReceipts}
          receipt={lastNonRefundReceipt}
        />
      )}
    </div>
  );
};

export default Receipt;
