import type { ReceiptProps } from './Receipt';

export type ExecutionProps = {
  receipt: FailedToFindReceipt | NestedReceiptWithOutcome;
};

let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

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
        loading={
          <div>
            <div className="flex items-center pb-3">
              <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3"></span>
              <Skeleton className="block h-5 w-28" loading>
                <span className="font-heading font-semibold text-sm">
                  &nbsp;
                </span>
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
                <span className="font-heading font-semibold text-sm">
                  &nbsp;
                </span>
              </Skeleton>
            </div>
          </div>
        }
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
