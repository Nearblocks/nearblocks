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

let tabs = [0];
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

const Tabs = ({ hash, rpcUrl }: TabsProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { nestReceipts, parseOutcome, parseReceipt } =
    VM.require<ExecutionModule>(`${config_account}/widget/lite.libs.execution`);

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
        })
        .catch((err: unknown) =>
          setError((state: Error) => ({ ...state, [active]: err })),
        )
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, [active]: false })),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, active, data]);

  const ExecutionLoader = () => (
    <div>
      <div className="flex justify-between items-center text-sm mb-6">
        <Skeleton className="block h-5 w-40" loading>
          <span className="text-text-label">&nbsp;</span>
        </Skeleton>
      </div>
      <div className="flex items-center pb-3">
        <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3"></span>
        <Skeleton className="block h-5 w-28" loading>
          <span className="font-heading font-semibold text-sm">&nbsp;</span>
        </Skeleton>
      </div>
      <div className="relative ml-2 mb-3 py-3 px-4">
        <div className="arrow absolute h-full left-0 top-0 border-l border-border-body"></div>
        <div className="space-y-2">
          <div>
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
      </div>
      <div className="flex items-center pb-3">
        <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3" />
        <Skeleton className="block h-5 w-28" loading>
          <span className="font-heading font-semibold text-sm">&nbsp;</span>
        </Skeleton>
      </div>
    </div>
  );

  return (
    <div className="bg-bg-box lg:rounded-xl shadow px-6 mt-8">
      <div className="pt-4 pb-6">
        {tabs.map((tab) => (
          <button
            className={`py-1 mr-4 ${
              active === tab
                ? 'font-medium border-b-[3px] border-text-body'
                : 'text-text-label'
            }`}
            key={tab}
            onClick={() => setActive(tab)}
          >
            {tab === 0 && 'Execution Plan'}
          </button>
        ))}
      </div>
      <div className="lg:px-4 pb-6">
        {error[active] ? (
          <Widget<ErrorProps>
            key="error"
            props={{ title: 'Error Fetching Txn Details' }}
            src={`${config_account}/widget/lite.Atoms.Error`}
          />
        ) : loading[active] ? (
          <>{active === 0 && <ExecutionLoader />}</>
        ) : (
          <>
            {active === 0 && (
              <Widget<ExecutionProps>
                key="execution"
                loading={<ExecutionLoader />}
                props={{ receipt: data[active] as NestedReceiptWithOutcome }}
                src={`${config_account}/widget/lite.Txn.Execution`}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Tabs;
