import type { RpcResultBlock } from 'nb-near';

import type { CopyProps } from '@/Atoms/Copy';
import type { ErrorProps } from '@/Atoms/Error';
import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';

export type BlockProps = {
  hash: string;
  rpcUrl: string;
};

let ErrorSkeleton = window?.ErrorSkeleton || (() => <></>);
let BlockSkeleton = window?.BlockSkeleton || (() => <></>);
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

const Container = styled.div<{ theme: string }>`
  --font-heading: 'Manrope', sans-serif;
  --font-sans: 'Inter', sans-serif;
  ${(props: any) =>
    props.theme === 'light'
      ? `--color-primary: 3 63 64;
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
  --color-text-input: 162 162 168;
  --color-text-label: 162 162 168;
  --color-text-function: 63 66 70;
  --color-text-warning: 255 75 85;
  --color-text-tooltip: 230 230 230;
  --color-border-body: 225 225 225;`
      : `--color-primary: 49 118 106;
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
  --color-border-box: 120 120 120;`};
  position: relative;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  @media (min-width: 1024px) {
    max-width: 1024px;
  }
  @media (min-width: 1280px) {
    max-width: 1072px;
  }
  .blockSkeleton {
    display: block;
    height: 48px;
    @media (min-width: 1024px) {
      height: 54px;
    }
    width: 14rem;
  }
`;

const BlockContainer = styled.div`
  padding-top: 1.75rem;
  padding-bottom: 26px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
`;

const BlockHeading = styled.h1`
  display: flex;
  align-items: center;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  letter-spacing: 0.1px;
  margin-right: 1rem;
  @media (min-width: 1024px) {
    font-size: 36px;
  }
  .headingSpan {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .copyButton {
    margin-left: 0.75rem;
    background-color: transparent;
    background-image: none;
    border: none;
  }
  .copyClass {
    color: rgb(var(--color-primary));
    width: 1.5rem;
  }
`;

const BlockStatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  .statsSkeleton {
    display: block;
    height: 39px;
    width: 8rem;
  }
  .statsSkeletonType {
    display: block;
    height: 39px;
    width: 7rem /* 112px */;
  }
`;

const BlockStatsDataContainer = styled.div`
  width: 100%;
  @media (min-width: 640px) {
    width: 50%;
  }
  @media (min-width: 1024px) {
    width: 33.333333%;
  }
  padding-left: 1.25rem;
  margin-bottom: 1.5rem;
  height: 60px;
  .common-skeleton {
    display: block;
    height: 39px;
    overflow: hidden;
  }
  .width-10 {
    width: 2.5rem;
  }
  .width-32 {
    width: 8rem;
  }
  .width-36 {
    width: 9rem;
  }
  .width-48 {
    width: 12rem;
  }
  .width-52 {
    width: 13rem;
  }
  .width-60 {
    width: 15rem;
  }
`;

const BlockStatsDataHeading = styled.h2`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.125rem;
`;

const BlockSatsData = styled.div<{ fsize?: string }>`
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: ${(props: any) => (props.fsize ? props.fsize : '')};
  .copyBlockSatsButton {
    margin-left: 0.25rem;
    background-color: transparent;
    background-image: none;
    border: none;
  }
  .copyBlockSatsClass {
    color: rgb(var(--color-primary));
    width: 1rem;
  }
  .linkclass {
    color: inherit;
    text-decoration: inherit;

    &:hover {
      text-decoration: none;
    }
  }
`;

const Block = ({ hash, rpcUrl }: BlockProps) => {
  let { rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { nsToDateTime, yoctoToNear, yoctoToTgas } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (
    !rpcFetch ||
    !nsToDateTime ||
    !yoctoToNear ||
    !yoctoToTgas ||
    !formatNumber ||
    !shortenString
  )
    return <BlockSkeleton />;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<null | RpcResultBlock>(null);

  useEffect(() => {
    if (rpcFetch && rpcUrl && hash) {
      setLoading(true);
      const blockId = !isNaN(Number(hash)) ? Number(hash) : hash;

      rpcFetch<RpcResultBlock>(rpcUrl, 'block', { block_id: blockId })
        .then((response) => {
          setBlock(response);
          setError(null);
        })
        .catch(setError)
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, rpcUrl]);

  const gas = useMemo(() => {
    let limit = 0;
    let used = 0;
    let fee = '0';

    if (block) {
      limit = block.chunks.reduce((acc, curr) => acc + curr.gas_limit, 0);
      used = block.chunks.reduce((acc, curr) => acc + curr.gas_used, 0);
      fee = Big(used).mul(Big(block.header.gas_price)).toString();
    }

    return { fee, limit, used };
  }, [block]);

  if (error) {
    return (
      <Widget<ErrorProps>
        key="error"
        loading={<ErrorSkeleton />}
        props={{ title: 'Error Fetching Block' }}
        src={`${config_account}/widget/lite.Atoms.Error`}
      />
    );
  }
  return (
    <Container theme={'black'}>
      <BlockContainer>
        <Skeleton className="blockSkeleton" loading={loading}>
          <BlockHeading>
            {formatNumber(String(block?.header.height ?? 0), 2)}
            <Widget<CopyProps>
              key="copy"
              props={{
                buttonClassName: 'copyButton',
                className: 'copyClass',
                text: String(block?.header.height),
              }}
              src={`${config_account}/widget/lite.Atoms.Copy`}
            />
          </BlockHeading>
        </Skeleton>
      </BlockContainer>
      <BlockStatsContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Hash</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-48" loading={loading}>
            <BlockSatsData fsize="26px">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: shortenString(block?.header.hash ?? ''),
                  tooltip: block?.header.hash,
                }}
                src={`${config_account}/widget/lite.Atoms.Tooltip`}
              />
              <Widget<CopyProps>
                key="copy"
                props={{
                  buttonClassName: 'copyBlockSatsButton',
                  className: 'copyBlockSatsClass',
                  text: block?.header.hash!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Time</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-60" loading={loading}>
            <BlockSatsData fsize="24px">
              {nsToDateTime(
                block?.header.timestamp_nanosec ?? '0',
                'DD/MM/YY hh:mm:ss AA',
              )}
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Author</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-52" loading={loading}>
            <BlockSatsData fsize="26px">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link
                      className="linkclass"
                      href={`/address/${block?.author}`}
                    >
                      {shortenString(block?.author ?? '')}
                    </Link>
                  ),
                  tooltip: block?.author,
                }}
                src={`${config_account}/widget/lite.Atoms.Tooltip`}
              />
              <Widget<CopyProps>
                key="copy"
                props={{
                  buttonClassName: 'copyBlockSatsButton',
                  className: 'copyBlockSatsClass',
                  text: block?.author!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Gas Used</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-32" loading={loading}>
            <BlockSatsData fsize="26px">
              {formatNumber(yoctoToTgas(String(gas.used)), 0)} Tgas
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Gas Price</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-48" loading={loading}>
            <BlockSatsData fsize="26px">
              {formatNumber(yoctoToTgas(block?.header.gas_price ?? '0'), 4)} Ⓝ /
              Tgas
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Gas Limit</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-36" loading={loading}>
            <BlockSatsData fsize="26px">
              {formatNumber(yoctoToTgas(String(gas.limit)), 0)} Tgas
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Gas Fee</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-36" loading={loading}>
            <BlockSatsData fsize="26px">
              {formatNumber(yoctoToNear(gas.fee), 6)} Ⓝ
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Shards</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-10" loading={loading}>
            <BlockSatsData fsize="26px">
              {block?.header.chunks_included ?? 0}
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
        <BlockStatsDataContainer>
          <BlockStatsDataHeading>Parent Hash</BlockStatsDataHeading>
          <Skeleton className="common-skeleton width-48" loading={loading}>
            <BlockSatsData fsize="26px">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link
                      className="linkclass"
                      href={`/blocks/${block?.header.prev_hash}`}
                    >
                      {shortenString(block?.header.prev_hash ?? '')}
                    </Link>
                  ),
                  tooltip: block?.header.prev_hash,
                }}
                src={`${config_account}/widget/lite.Atoms.Tooltip`}
              />
              <Widget<CopyProps>
                key="copy"
                props={{
                  buttonClassName: 'copyBlockSatsButton',
                  className: 'copyBlockSatsClass',
                  text: block?.header.prev_hash!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </BlockSatsData>
          </Skeleton>
        </BlockStatsDataContainer>
      </BlockStatsContainer>
    </Container>
  );
};

export default Block;
