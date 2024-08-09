import type { ActionsProps } from './Actions';
import type { AddressProps } from './Address';

export type ReceiptProps = {
  className?: string;
  convertion: boolean;
  expand: boolean;
  outgoingReceipts: (FailedToFindReceipt | NestedReceiptWithOutcome)[];
  receipt: FailedToFindReceipt | NestedReceiptWithOutcome;
};

let TxnActionSkeleton = window?.TxnActionSkeleton || (() => <></>);
let TxnAddressSkeleton = window?.TxnAddressSkeleton || (() => <></>);
let TxnReceiptSkeleton = window?.TxnReceiptSkeleton || (() => <></>);

const Container = styled.div`
  .receipt {
    margin-left: 0.5rem;
    padding-left: 1rem;
    border-left-width: 1px;
    border-color: rgb(var(--color-border-body));
  }
`;
const ActionContainer = styled.div`
  position: relative;
  margin-left: 0.5rem /* 8px */;
  margin-bottom: 0.75rem /* 12px */;
  padding-top: 0.75rem /* 12px */;
  padding-bottom: 0.75rem /* 12px */;
  padding-left: 1rem /* 16px */;
  padding-right: 1rem /* 16px */;
`;

const Arrow = styled.div`
  position: absolute;
  height: 100%;
  left: 0px;
  top: 0px;
  border-left-width: 1px;
  border-color: rgb(var(--color-border-body));
`;

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

  if (!('outcome' in receipt)) return <TxnReceiptSkeleton />;

  const remainingOutgoingReceipts = outgoingReceipts.slice(0, -1);
  const lastOutgoingReceipt = outgoingReceipts.at(-1);
  const filterRefundReceipts = receipt.outcome.nestedReceipts.filter(
    (nestedReceipt) =>
      'outcome' in nestedReceipt && nestedReceipt.predecessorId !== 'system',
  );
  const nonRefundReceipts = filterRefundReceipts.slice(0, -1);
  const lastNonRefundReceipt = filterRefundReceipts.at(-1);

  return (
    <Container className={className}>
      {convertion && (
        <Widget<AddressProps>
          key="address-1"
          loading={<TxnAddressSkeleton />}
          props={{ address: receipt.predecessorId }}
          src={`${config_account}/widget/lite.Txn.Address`}
        />
      )}
      {lastOutgoingReceipt && (
        <Widget<ReceiptProps>
          key="execution-1"
          loading={<TxnReceiptSkeleton />}
          props={{
            className: 'receipt',
            convertion: false,
            expand,
            outgoingReceipts: remainingOutgoingReceipts,
            receipt: lastOutgoingReceipt,
          }}
          src={`${config_account}/widget/lite.Txn.Receipt`}
        />
      )}
      <ActionContainer>
        <Arrow className="arrow" />
        <Widget<ActionsProps>
          key="actions"
          loading={<TxnActionSkeleton />}
          props={{
            actions: receipt.actions,
            open,
            receipt,
            setOpen,
          }}
          src={`${config_account}/widget/lite.Txn.Actions`}
        />
      </ActionContainer>
      <Widget<AddressProps>
        key="address-2"
        loading={<TxnAddressSkeleton />}
        props={{ address: receipt.receiverId }}
        src={`${config_account}/widget/lite.Txn.Address`}
      />
      {lastNonRefundReceipt && (
        <Widget<ReceiptProps>
          key="execution-2"
          loading={<TxnReceiptSkeleton />}
          props={{
            convertion: false,
            expand,
            outgoingReceipts: nonRefundReceipts,
            receipt: lastNonRefundReceipt,
          }}
          src={`${config_account}/widget/lite.Txn.Receipt`}
        />
      )}
    </Container>
  );
};

export default Receipt;
