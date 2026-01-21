import { TxnReceiptSkeleton } from '@/components/Skeletons/Txn';
import TxnReceipt from '@/components/Transaction/TxnReceipt';
interface TxnExecutionProps {
  expand: boolean;
  receipt: any;
}

const TxnExecution = ({ expand, receipt }: TxnExecutionProps) => {
  if (!receipt) {
    return <TxnReceiptSkeleton />;
  }

  return (
    <TxnReceipt
      conversion={true}
      expand={expand}
      outgoingReceipts={[]}
      receipt={receipt}
    />
  );
};

export default TxnExecution;
