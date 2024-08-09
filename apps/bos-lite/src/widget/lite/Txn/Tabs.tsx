import type { ErrorProps } from '@/Atoms/Error';
import type { ExecutionModule } from '@/libs/execution';
import type { FetcherModule } from '@/libs/fetcher';
import type { ExecutionProps } from '@/Txn/Execution';

export type TabsProps = {
  hash: string;
  rpcUrl: string;
};

type Data = {
  [key: number]: unknown;
};

type Loading = {
  [key: number]: boolean;
};

type Error = {
  [key: number]: unknown;
};

let ErrorSkeleton = window?.ErrorSkeleton || (() => <></>);
let TxnTabsSkeleton = window?.TxnTabsSkeleton || (() => <></>);
let TxnExecutionSkeleton = window?.TxnExecutionSkeleton || (() => <></>);

let tabs = [0];

const Container = styled.div`
  background-color: rgb(var(--color-bg-box));
  @media (min-width: 1024px) {
    border-radius: 0.75rem;
  }
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color),
    0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  margin-top: 2rem;
`;
const TabContainer = styled.div`
  padding-top: 1rem;
  padding-bottom: 1.5rem;
`;

const Button = styled.button<{ isActive: boolean }>`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-right: 1rem;
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  border-top: none;
  border-left: none;
  border-right: none;
  ${(props: any) =>
    props.isActive
      ? `font-weight: 500; border-bottom-width: 3px;  border-color: rgb(var(--color-text-body));`
      : `color: rgb(var(--color-text-label));`};
`;

const Tabs = ({ hash, rpcUrl }: TabsProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { nestReceipts, parseOutcome, parseReceipt } =
    VM.require<ExecutionModule>(`${config_account}/widget/lite.libs.execution`);

  if (!rpcFetch || !nestReceipts || !parseOutcome || !parseReceipt)
    return <TxnTabsSkeleton />;

  const [active, setActive] = useState(tabs[0]);
  const [data, setData] = useState<Data>({});
  const [error, setError] = useState<Error>({});
  const [loading, setLoading] = useState<Loading>({});

  useEffect(() => {
    if (rpcFetch && rpcUrl && hash && active === 0) {
      setLoading((prev: Loading) => ({ ...prev, [active]: true }));
      rpcFetch<FinalExecutionOutcomeWithReceiptView>(
        rpcUrl,
        'EXPERIMENTAL_tx_status',
        {
          sender_account_id: 'bowen',
          tx_hash: hash,
          wait_until: 'NONE',
        },
      )
        .then((response) => {
          const blocksMap = response.receipts_outcome.reduce(
            (map, row) =>
              map.set(row.block_hash, {
                hash: row.block_hash,
                height: 0,
                timestamp: 0,
              }),
            new Map<string, ParsedBlock>(),
          );
          const receiptsMap = response.receipts_outcome.reduce(
            (mapping, receiptOutcome) => {
              const receipt = parseReceipt(
                response.receipts.find(
                  (rpcReceipt) => rpcReceipt.receipt_id === receiptOutcome.id,
                ),
                receiptOutcome,
                response.transaction,
              );
              return mapping.set(receiptOutcome.id, {
                ...receipt,
                outcome: parseOutcome(receiptOutcome, blocksMap),
              });
            },
            new Map<string, ParsedReceipt>(),
          );

          setData((state: Data) => ({
            ...state,
            [active]: nestReceipts(
              response.transaction_outcome.outcome.receipt_ids[0],
              receiptsMap,
            ),
          }));
          setError((state: Error) => ({ ...state, [active]: null }));
        })
        .catch((err: unknown) =>
          setError((state: Error) => ({ ...state, [active]: err })),
        )
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, [active]: false })),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, active, data, rpcUrl]);

  return (
    <Container>
      <TabContainer>
        {tabs.map((tab) => (
          <Button
            isActive={active === tab}
            key={tab}
            onClick={() => setActive(tab)}
          >
            {tab === 0 && 'Execution Plan'}
          </Button>
        ))}
      </TabContainer>
      <div className="lg:px-4 pb-6">
        {error[active] ? (
          <Widget<ErrorProps>
            key="error"
            loading={<ErrorSkeleton />}
            props={{ title: 'Error Fetching Txn Details' }}
            src={`${config_account}/widget/lite.Atoms.Error`}
          />
        ) : loading[active] ? (
          <>{active === 0 && <TxnExecutionSkeleton />}</>
        ) : (
          <>
            {active === 0 && (
              <Widget<ExecutionProps>
                key="execution"
                loading={<TxnExecutionSkeleton />}
                props={{ receipt: data[active] as NestedReceiptWithOutcome }}
                src={`${config_account}/widget/lite.Txn.Execution`}
              />
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default Tabs;
