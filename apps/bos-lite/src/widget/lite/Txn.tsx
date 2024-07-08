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

let ErrorSkeleton = window?.ErrorSkeleton || (() => <></>);
let TxnSkeleton = window?.TxnSkeleton || (() => <></>);
let TxnTabsSkeleton = window?.TxnTabsSkeleton || (() => <></>);
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

const Container = styled.div`
  --font-heading: 'Manrope', sans-serif;
  --font-sans: 'Inter', sans-serif;
  --color-primary: 3 63 64;
  --color-bg-body: 251 253 255;
  --color-bg-box: 255 255 255;
  --color-bg-skeleton: 229 231 235;
  --color-bg-tooltip: 30 32 34;
  --color-bg-code: 248 248 248;
  --color-bg-function: 238 250 255;
  --color-bg-transfer: 240 255 238;
  --color-bg-stake: 225 253 255;
  --color-bg-contract: 255 242 228;
  --color-bg-account-add: 244 253 219;
  --color-bg-account-delete: 249 214 217;
  --color-bg-key-add: 236 241 254;
  --color-bg-key-delete: 250 242 242;
  --color-text-body: 63 66 70;
  --color-text-box: 17 22 24;
  --color-text-input: 162 162 168;
  --color-text-label: 162 162 168;
  --color-text-function: 63 66 70;
  --color-text-warning: 255 75 85;
  --color-text-tooltip: 230 230 230;
  --color-border-body: 225 225 225;

  .dark {
    --color-primary: 49 118 106;
    --color-bg-body: 19 20 21;
    --color-bg-box: 30 32 34;
    --color-bg-skeleton: 61 64 70;
    --color-bg-tooltip: 40 42 44;
    --color-bg-code: 44 44 44;
    --color-bg-function: 238 250 255;
    --color-bg-transfer: 240 255 238;
    --color-bg-stake: 225 253 255;
    --color-bg-contract: 255 242 228;
    --color-bg-account-add: 244 253 219;
    --color-bg-account-delete: 249 214 217;
    --color-bg-key-add: 236 241 254;
    --color-bg-key-delete: 250 242 242;
    --color-text-body: 230 230 230;
    --color-text-box: 230 230 230;
    --color-text-input: 162 162 168;
    --color-text-label: 162 162 168;
    --color-text-tooltip: 230 230 230;
    --color-text-function: 63 66 70;
    --color-text-warning: 255 75 85;
    --color-border-body: 51 51 51;
    --color-border-box: 120 120 120;
  }
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;

  @media (min-width: 1024px) {
    max-width: 1024px;
  }

  @media (min-width: 1280px) {
    max-width: 1072px;
  }
  .span-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .skeleton-w-200 {
    width: 200px;
  }
  .skeleton-w-32 {
    width: 8rem;
  }
  .skeleton-w-280 {
    width: 280px;
  }
  .skeleton-w-28 {
    width: 7rem;
  }
  .skeleton-w-140 {
    width: 140px;
  }
  .title-btn {
    margin-left: 0.75rem;
  }
  .title-copy {
    color: rgb(var(--color-primary));
    width: 1.5rem;
  }
  .value-btn {
    margin-left: 0.25rem;
  }
  .value-copy {
    color: rgb(var(--color-primary));
    width: 1rem;
  }
  .tooltip-mr-1 {
    margin-right: 0.25rem;
  }
  .tooltip-loader {
    display: block;
    width: 1rem;
    height: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tooltip-btn {
    vertical-align: text-bottom;
    height: 1rem;
  }
  .tooltip-copy {
    width: 1rem;
  }
`;
const Header = styled.div`
  padding-top: 1.75rem;
  padding-bottom: 26px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;

  .skeleton-header {
    display: block;
    height: 48px;
    width: 300px;

    @media (min-width: 1024px) {
      height: 54px;
    }
  }
`;
const Title = styled.div`
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 32px;
  letter-spacing: 0.1px;
  margin-right: 1rem;

  @media (min-width: 1024px) {
    font-size: 36px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const Block = styled.div`
  width: 100%;
  padding-left: 1.25rem;
  margin-bottom: 1.5rem;
  height: 60px;

  @media (min-width: 640px) {
    width: 50%;
  }

  @media (min-width: 1024px) {
    width: 33.333333%;
  }
  .block-skeleton {
    display: block;
    height: 39px;
  }
`;
const Label = styled.h2`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.125rem;
`;

const Value = styled.div`
  font-family: var(--font-heading);
  font-weight: 500;

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const ValueTop = styled(Value)`
  font-size: 26px;
`;

const ValueBottom = styled(Value)`
  font-size: 24px;
`;

const Txn = ({ hash, rpcUrl }: TxnProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { nsToDateTime, yoctoToNear } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { depositAmount, shortenString, txnFee } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (
    !rpcFetch ||
    !nsToDateTime ||
    !yoctoToNear ||
    !formatNumber ||
    !depositAmount ||
    !shortenString ||
    !txnFee
  )
    return <TxnSkeleton />;

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

  if (error) {
    return (
      <Widget<ErrorProps>
        key="error"
        loading={<ErrorSkeleton />}
        props={{ title: 'Error Fetching Txn' }}
        src={`${config_account}/widget/lite.Atoms.Error`}
      />
    );
  }

  return (
    <>
      <div className="lg:pt-9">
        <Widget
          key="Navbar"
          loading={<></>}
          src={`${config_account}/widget/lite.Header.Navbar`}
        />
      </div>
      <Container>
        <Header>
          <Skeleton className="skeleton-header" loading={loading.txn}>
            <Title>
              <span className="span-truncate">{shortenString(hash)}</span>
              <Widget<CopyProps>
                key="copy"
                props={{
                  buttonClassName: 'title-btn',
                  className: 'title-copy',
                  text: hash,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </Title>
          </Skeleton>
        </Header>
        <Section>
          <Block>
            <Label>From</Label>
            <Skeleton
              className="block-skeleton skeleton-w-200"
              loading={loading.txn}
            >
              <ValueTop>
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
                    buttonClassName: 'value-btn',
                    className: 'value-copy',
                    text: txn?.transaction.signer_id!,
                  }}
                  src={`${config_account}/widget/lite.Atoms.Copy`}
                />
              </ValueTop>
            </Skeleton>
          </Block>
          <Block>
            <Label>To</Label>
            <Skeleton
              className="block-skeleton skeleton-w-200"
              loading={loading.txn}
            >
              <ValueTop>
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
                    buttonClassName: 'value-btn',
                    className: 'value-copy',
                    text: txn?.transaction.receiver_id!,
                  }}
                  src={`${config_account}/widget/lite.Atoms.Copy`}
                />
              </ValueTop>
            </Skeleton>
          </Block>
          <Block>
            <Label>Block</Label>
            <Skeleton
              className="block-skeleton skeleton-w-32"
              loading={loading.block}
            >
              <ValueTop>
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
                        <span className="tooltip-mr-1">
                          {block?.header.hash}
                        </span>
                        <Widget<CopyProps>
                          key="copy"
                          loading={<span className="tooltip-loader" />}
                          props={{
                            buttonClassName: 'tooltip-btnf',
                            className: 'tooltip-copy',
                            text: block?.header.hash!,
                          }}
                          src={`${config_account}/widget/lite.Atoms.Copy`}
                        />
                      </span>
                    ),
                  }}
                  src={`${config_account}/widget/lite.Atoms.Tooltip`}
                />
              </ValueTop>
            </Skeleton>
          </Block>
          <Block>
            <Label>Time</Label>
            <Skeleton
              className="block-skeleton skeleton-w-280"
              loading={loading.block}
            >
              <ValueBottom>
                {nsToDateTime(
                  block?.header.timestamp_nanosec ?? '0',
                  'DD/MM/YY hh:mm:ss AA',
                )}
              </ValueBottom>
            </Skeleton>
          </Block>
          <Block>
            <Label>Amount</Label>
            <Skeleton
              className="block-skeleton skeleton-w-28"
              loading={loading.txn}
            >
              <ValueBottom>
                {formatNumber(
                  yoctoToNear(
                    depositAmount(
                      (txn?.transaction.actions as ActionView[]) ?? [],
                    ),
                  ),
                  6,
                )}{' '}
                Ⓝ
              </ValueBottom>
            </Skeleton>
          </Block>
          <Block>
            <Label>Fee</Label>
            <Skeleton
              className="block-skeleton skeleton-w-140"
              loading={loading.txn}
            >
              <ValueBottom>
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
              </ValueBottom>
            </Skeleton>
          </Block>
        </Section>
        <Widget<TabsProps>
          key="tabs"
          loading={<TxnTabsSkeleton />}
          props={{ hash, rpcUrl }}
          src={`${config_account}/widget/lite.Txn.Tabs`}
        />
      </Container>
    </>
  );
};

export default Txn;
