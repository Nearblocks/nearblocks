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
      const blockId = !isNaN(Number(hash)) ? Number(hash) : hash;

      rpcFetch<RpcResultBlock>(rpcUrl, 'block', { block_id: blockId })
        .then((response) => setBlock(response))
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
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton className="block h-[48px] lg:h-[54px] w-56" loading={loading}>
          <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
            {formatNumber(String(block?.header.height ?? 0), 2)}
            <Widget<CopyProps>
              key="copy"
              props={{
                buttonClassName: 'ml-3',
                className: 'text-primary w-6',
                text: String(block?.header.height),
              }}
              src={`${config_account}/widget/lite.Atoms.Copy`}
            />
          </h1>
        </Skeleton>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Hash</h2>
          <Skeleton
            className="block h-[39px] w-48 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
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
                  buttonClassName: 'ml-1',
                  className: 'text-primary w-4',
                  text: block?.header.hash!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Time</h2>
          <Skeleton
            className="block h-[39px] w-60 overflow-hidden"
            loading={loading}
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
          <h2 className="font-medium text-sm mb-0.5">Author</h2>
          <Skeleton
            className="block h-[39px] w-52 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link href={`/address/${block?.author}`}>
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
                  buttonClassName: 'ml-1',
                  className: 'text-primary w-4',
                  text: block?.author!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Used</h2>
          <Skeleton
            className="block h-[39px] w-32 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToTgas(String(gas.used)), 0)} Tgas
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Price</h2>
          <Skeleton
            className="block h-[39px] w-48 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToTgas(block?.header.gas_price ?? '0'), 4)} Ⓝ /
              Tgas
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Limit</h2>
          <Skeleton
            className="block h-[39px] w-36 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToTgas(String(gas.limit)), 0)} Tgas
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Gas Fee</h2>
          <Skeleton
            className="block h-[39px] w-36 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToNear(gas.fee), 6)} Ⓝ
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Shards</h2>
          <Skeleton
            className="block h-[39px] w-10 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              {block?.header.chunks_included ?? 0}
            </div>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Parent Hash</h2>
          <Skeleton
            className="block h-[39px] w-48 overflow-hidden"
            loading={loading}
          >
            <div className="font-heading font-medium text-[26px]">
              <Widget<TooltipProps>
                key="tooltip"
                props={{
                  children: (
                    <Link href={`/blocks/${block?.header.prev_hash}`}>
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
                  buttonClassName: 'ml-1',
                  className: 'text-primary w-4',
                  text: block?.header.prev_hash!,
                }}
                src={`${config_account}/widget/lite.Atoms.Copy`}
              />
            </div>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default Block;
