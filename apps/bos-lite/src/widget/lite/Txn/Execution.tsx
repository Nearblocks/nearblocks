import type { ReceiptProps } from './Receipt';

export type ExecutionProps = {
  receipt: FailedToFindReceipt | NestedReceiptWithOutcome;
};

let TxnReceiptSkeleton = window?.TxnReceiptSkeleton || (() => <></>);

const Execution = ({ receipt }: ExecutionProps) => {
  const [expand, setExpand] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center text-sm mb-6">
        <span className="text-text-label">&nbsp;</span>
        <button onClick={() => setExpand((e) => !e)}>
          {expand ? 'Collapse All -' : 'Expand All +'}
        </button>
      </div>
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
