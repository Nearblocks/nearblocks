import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { Stats, StatsResponse } from '@/types/types';

let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

const Stats = () => {
  let { apiFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { formatNumber, formatScale } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { yoctoToTgas } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );

  formatNumber = formatNumber || (() => <></>);
  formatScale = formatScale || (() => <></>);
  yoctoToTgas = yoctoToTgas || (() => <></>);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<null | Stats>(null);

  useEffect(() => {
    if (apiFetch) {
      apiFetch<StatsResponse>(`${alias_api_url}/stats`)
        .then((response) => setStats(response?.stats?.[0]))
        .catch(console.log)
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lg:flex flex-wrap justify-between px-3 lg:px-0">
      <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
        <div className="px-3 mb-[42px]">
          <p className="font-heading font-medium text-[39px] tracking-[0.6px] -mb-[5px]">
            <Skeleton className="w-28" loading={loading}>
              {formatScale(stats?.total_txns ?? '0', 2)}
            </Skeleton>
          </p>
          <h3 className="font-normal text-[20px]">Transactions</h3>
        </div>
        <div className="px-3 mb-[42px]">
          <p className="font-heading font-medium text-[39px] tracking-[0.6px] -mb-[5px] sm:text-right lg:text-left">
            <Skeleton className="w-16" loading={loading}>
              {formatNumber(String(stats?.nodes_online ?? 0), 0)}
            </Skeleton>
          </p>
          <h3 className="text-[20px] font-normal sm:text-right lg:text-left">
            Active Validators
          </h3>
        </div>
      </div>
      {context.networkId === 'mainnet' && (
        <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
          <div className="px-3 mb-[42px]">
            <p className="font-heading font-medium text-[39px] tracking-[0.6px] lg:text-center -mb-[5px]">
              <Skeleton className="w-28" loading={loading}>
                ${formatNumber(stats?.near_price ?? '0', 2)}
              </Skeleton>
            </p>
            <h3 className="text-[20px] font-normal lg:text-center">
              Near Price
            </h3>
          </div>
          <div className="px-3 mb-[42px]">
            <p className="font-heading font-medium text-[39px] tracking-[0.6px] sm:text-right lg:text-center -mb-[5px]">
              <Skeleton className="w-36" loading={loading}>
                ${formatScale(stats?.market_cap ?? '0', 2)}
              </Skeleton>
            </p>
            <h3 className="font-normal text-[20px] sm:text-right lg:text-center">
              Market Cap
            </h3>
          </div>
        </div>
      )}
      <div className="sm:flex lg:block flex-wrap justify-between lg:min-w-[200px]">
        <div className="px-3 mb-[42px]">
          <p className="font-heading font-medium text-[39px] tracking-[0.6px] lg:text-right -mb-[5px]">
            <Skeleton className="w-44" loading={loading}>
              {formatNumber(yoctoToTgas(stats?.gas_price ?? '0'), 4)} Ⓝ
            </Skeleton>
          </p>
          <h3 className="font-normal text-[20px] lg:text-right">
            Gas Price / Tgas
          </h3>
        </div>
        <div className="px-3 mb-[42px]">
          <p className="font-heading font-medium text-[39px] tracking-[0.6px] sm:text-right lg:text-right -mb-[5px]">
            <Skeleton className="w-36" loading={loading}>
              {formatNumber(stats?.avg_block_time ?? '0', 4)}s
            </Skeleton>
          </p>
          <h3 className="font-normal text-[20px] sm:text-right lg:text-right">
            Avg. Block Time
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Stats;
