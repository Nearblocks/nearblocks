import type { ReceiptProps } from './Receipt';

export type ExecutionProps = {
  expand: boolean;
  receipt: FailedToFindReceipt | NestedReceiptWithOutcome;
};

let TxnReceiptSkeleton = window?.TxnReceiptSkeleton || (() => <></>);

const Execution = ({ expand, receipt }: ExecutionProps) => {
  return (
    <>
      <Widget<ReceiptProps>
        key="receipt"
        loading={<TxnReceiptSkeleton />}
        props={{
          convertion: true,
          expand,
          outgoingReceipts: [],
          receipt,
        }}
        src={`${config_account}/widget/lite.Txn.Receipt`}
      />
    </>
  );
};

export default Execution;
