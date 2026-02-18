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
      isFirst ? 'ml-0' : 'mt-4 ml-3'
    } divide-border border-border divide-y border-l-4`}
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
