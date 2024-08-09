import type { ReceiptProps } from './Receipt';

export type ExecutionProps = {
  receipt: FailedToFindReceipt | NestedReceiptWithOutcome;
};

let TxnReceiptSkeleton = window?.TxnReceiptSkeleton || (() => <></>);

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 1.5rem;
`;
const TextLabel = styled.span`
  color: var(--text-label);
`;
const Botton = styled.button`
  background-color: transparent;
  background-image: none;
  border: none;
`;

const Execution = ({ receipt }: ExecutionProps) => {
  const [expand, setExpand] = useState(false);

  return (
    <>
      <Container>
        <TextLabel>&nbsp;</TextLabel>
        <Botton onClick={() => setExpand((e) => !e)}>
          {expand ? 'Collapse All -' : 'Expand All +'}
        </Botton>
      </Container>
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
