import type { RpcResultBlock, RpcResultTxn } from 'nb-near';

import type { CopyProps } from '@/Atoms/Copy';
import type { ErrorProps } from '@/Atoms/Error';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';
import type { TabsProps } from '@/Txn/Tabs';

type TxnProps = {
  hash: string;
  rpcUrl: string;
};

type Loading = {
  block: boolean;
  txn: boolean;
};

let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

const Txn = ({ hash, rpcUrl }: TxnProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { nsToDateTime, yoctoToNear } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber, formatSize } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { depositAmount, shortenString, txnFee } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  nsToDateTime = nsToDateTime || (() => <></>);
  yoctoToNear = yoctoToNear || (() => <></>);
  formatNumber = formatNumber || (() => <></>);
  formatSize = formatSize || (() => <></>);
  depositAmount = depositAmount || (() => <></>);
  shortenString = shortenString || (() => <></>);
  txnFee = txnFee || (() => <></>);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<Loading>({
    block: true,
    txn: true,
  });
  const [txn, setTxn] = useState<null | RpcResultTxn>(null);
  const [block, setBlock] = useState<null | RpcResultBlock>(null);

  useEffect(() => {
    if (rpcFetch && rpcUrl && hash) {
      rpcFetch<RpcResultTxn>(rpcUrl, 'tx', {
        sender_account_id: 'bowen',
        tx_hash: hash,
        wait_until: 'NONE',
      })
        .then((response) => {
          setTxn(response);
          rpcFetch<RpcResultBlock>(rpcUrl, 'block', {
            block_id: response.transaction_outcome.block_hash,
          })
            .then((response) => setBlock(response))
            .catch(setError)
            .finally(() =>
              setLoading((state: Loading) => ({ ...state, block: false })),
            );
        })
        .catch(setError)
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, txn: false })),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, rpcUrl]);

  const TabsLoader = () => (
    <div className="bg-bg-box lg:rounded-xl shadow px-6 mt-8">
      <div className="pt-4 pb-6">
        <button className="py-1 mr-4 font-medium border-b-[3px] border-text-body">
          Execution Plan
        </button>
      </div>
      <div className="lg:px-4 py-4">
        <div>
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
      </div>
    </div>
  );

  if (error) {
    return (
      <Widget<ErrorProps>
        key="error"
        props={{ title: 'Error Fetching Txn' }}
        src={`${config_account}/widget/lite.Atoms.Error`}
      />
    );
  }

  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton className="block h-[54px] w-[300px]" loading={loading.txn}>
          <h1 className="flex items-center font-heading font-medium text-[36px] tracking-[0.1px] mr-4">
            <span className="truncate">{shortenString(hash)}</span>
            <Widget<CopyProps>
              key="copy"
              props={{
                buttonClassName: 'ml-3',
                className: 'text-primary w-6',
                text: hash,
              }}
              src={`${config_account}/widget/lite.Atoms.Copy`}
            />
          </h1>
        </Skeleton>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">From</h2>
          <Skeleton className="block h-[39px] w-[200px]" loading={loading.txn}>
            <div className="font-heading font-medium text-[26px]">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link href={`/address/${txn?.transaction.signer_id}`}>
                      {shortenString(txn?.transaction.signer_id ?? '')}
                    </Link>
                  ),
                  tooltip: txn?.transaction.signer_id,
                }}
                src={`${config_account}/widget/lite.Atoms.Tooltip`}
              />
              <Widget<CopyProps>
                key="copy"
                props={{
                  buttonClassName: 'ml-1',
                  className: 'text-primary w-4',
                  text: txn?.transaction.signer_id!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">To</h2>
          <Skeleton className="block h-[39px] w-[200px]" loading={loading.txn}>
            <div className="font-heading font-medium text-[26px]">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link href={`/address/${txn?.transaction.receiver_id}`}>
                      {shortenString(txn?.transaction.receiver_id ?? '')}
                    </Link>
                  ),
                  tooltip: txn?.transaction.receiver_id,
                }}
                src={`${config_account}/widget/lite.Atoms.Tooltip`}
              />
              <Widget<CopyProps>
                key="copy"
                props={{
                  buttonClassName: 'ml-1',
                  className: 'text-primary w-4',
                  text: txn?.transaction.receiver_id!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Block</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading.block}>
            <div className="font-heading font-medium text-[26px]">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link href={`/blocks/${block?.header.height}`}>
                      {formatNumber(String(block?.header.height ?? 0), 0)}
                    </Link>
                  ),
                  tooltip: (
                    <span>
                      <span className="mr-1">{block?.header.hash}</span>
                      <Widget<CopyProps>
                        key="copy"
                        loading={<span className="block w-4 h-4 truncate" />}
                        props={{
                          buttonClassName: 'h-4 align-text-bottom',
                          className: 'w-4',
                          text: block?.header.hash!,
                        }}
                        src={`${config_account}/widget/lite.Atoms.Copy`}
                      />
                    </span>
                  ),
                }}
                src={`${config_account}/widget/lite.Atoms.Tooltip`}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Time</h2>
          <Skeleton
            className="block h-[39px] w-[280px]"
            loading={loading.block}
          >
            <div className="font-heading font-medium text-[24px]">
              {nsToDateTime(
                block?.header.timestamp_nanosec ?? '0',
                'DD/MM/YY hh:mm:ss AA',
              )}
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Amount</h2>
          <Skeleton className="block h-[39px] w-28" loading={loading.txn}>
            <div className="font-heading font-medium text-[24px]">
              {formatNumber(
                yoctoToNear(
                  depositAmount(
                    (txn?.transaction.actions as ActionView[]) ?? [],
                  ),
                ),
                6,
              )}{' '}
              Ⓝ
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Fee</h2>
          <Skeleton className="block h-[39px] w-[140px]" loading={loading.txn}>
            <div className="font-heading font-medium text-[24px]">
              {formatNumber(
                yoctoToNear(
                  txnFee(
                    (txn?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                      [],
                    txn?.transaction_outcome.outcome.tokens_burnt ?? '0',
                  ),
                ),
                6,
              )}{' '}
              Ⓝ
            </div>
          </Skeleton>
        </div>
      </div>
      <Widget<TabsProps>
        key="tabs"
        loading={<TabsLoader />}
        props={{ hash, rpcUrl }}
        src={`${config_account}/widget/lite.Txn.Tabs`}
      />
    </div>
  );
};

export default Txn;
