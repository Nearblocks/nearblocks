import type { TxnReceipt } from 'nb-schemas';

import { ReceiptBlock } from './receipt';

type Props = {
  depth: number;
  isFirst: boolean;
  receipt: TxnReceipt;
};

export const ReceiptTree = ({ depth, isFirst, receipt }: Props) => (
  <div
    className={`${
      isFirst
        ? 'ml-0'
        : 'mt-10 border-t-4 pt-4 md:mt-4 md:ml-3 md:border-t-0 md:pt-0'
    } divide-border md:border-border md:divide-y md:border-l-4`}
  >
    <ReceiptBlock receipt={receipt} />
    {receipt.receipts.map((child) => (
      <ReceiptTree
        depth={depth + 1}
        isFirst={false}
        key={child.receipt_id}
        receipt={child}
      />
    ))}
    {receipt.receipts.length > 0 && <div className="pb-4" />}
  </div>
);
