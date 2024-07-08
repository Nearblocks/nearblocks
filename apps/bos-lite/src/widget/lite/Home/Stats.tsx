import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { Stats, StatsResponse } from '@/types/types';

let HomeStatsSkeleton = window?.HomeStatsSkeleton || (() => <></>);
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

  @media (min-width: 1024px) {
    display: flex;
    padding-left: 0px;
    padding-right: 0px;
  }
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 0.75rem;

  .skeleton-w-28 {
    width: 7rem;
  }
  .skeleton-w-16 {
    width: 4rem;
  }
  .skeleton-w-36 {
    width: 11rem;
  }
  .skeleton-w-44 {
    width: 11rem;
  }
`;

const Section = styled.div`
  @media (min-width: 640px) {
    display: flex;
  }
  @media (min-width: 1024px) {
    display: block;
    min-width: 200px;
  }

  flex-wrap: wrap;
  justify-content: space-between;
`;

const StatBlock = styled.div`
  padding: 0 0.75rem;
  margin-bottom: 42px;
`;
const StatValue = styled.p<{
  lgLeft?: boolean;
  lgRight?: boolean;
  smLeft?: boolean;
  smRight?: boolean;
}>`
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 32px;
  letter-spacing: 0.6px;
  margin-bottom: -5px;

  @media (min-width: 1024px) {
    font-size: 38px;
  }
  @media (min-width: 640px) {
    text-align: ${(prop: any) =>
      prop.smRight ? 'right' : prop.smLeft ? 'left' : ''};
  }
  @media (min-width: 1024px) {
    text-align: ${(prop: any) =>
      prop.lgRight ? 'right' : prop.lgLeft ? 'left' : ''};
  }
`;

const StatLabel = styled.h3<{
  lgLeft?: boolean;
  lgRight?: boolean;
  smLeft?: boolean;
  smRight?: boolean;
}>`
  font-size: 20px;
  font-weight: 400;
  @media (min-width: 640px) {
    text-align: ${(prop: any) =>
      prop.smRight ? 'right' : prop.smLeft ? 'left' : ''};
  }
  @media (min-width: 1024px) {
    text-align: ${(prop: any) =>
      prop.lgRight ? 'right' : prop.lgLeft ? 'left' : ''};
  }
`;
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

  if (!apiFetch || !formatNumber || !formatScale || !yoctoToTgas)
    return <HomeStatsSkeleton />;

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
    <Container>
      <Section>
        <StatBlock>
          <StatValue>
            <Skeleton className="skeleton-w-28" loading={loading}>
              {formatScale(stats?.total_txns ?? '0', 2)}
            </Skeleton>
          </StatValue>
          <StatLabel>Transactions</StatLabel>
        </StatBlock>
        <StatBlock>
          <StatValue lgLeft smRight>
            <Skeleton className="skeleton-w-16" loading={loading}>
              {formatNumber(String(stats?.nodes_online ?? 0), 0)}
            </Skeleton>
          </StatValue>
          <StatLabel lgLeft smRight>
            Active Validators
          </StatLabel>
        </StatBlock>
      </Section>
      {context.networkId === 'mainnet' && (
        <Section>
          <StatBlock>
            <StatValue>
              <Skeleton className="skeleton-w-28" loading={loading}>
                ${formatNumber(stats?.near_price ?? '0', 2)}
              </Skeleton>
            </StatValue>
            <StatLabel>Near Price</StatLabel>
          </StatBlock>
          <StatBlock>
            <StatValue lgLeft smRight>
              <Skeleton className="skeleton-w-36" loading={loading}>
                ${formatScale(stats?.market_cap ?? '0', 2)}
              </Skeleton>
            </StatValue>
            <StatLabel lgLeft smRight>
              Market Cap
            </StatLabel>
          </StatBlock>
        </Section>
      )}
      <Section>
        <StatBlock>
          <StatValue lgRight>
            <Skeleton className="skeleton-w-44" loading={loading}>
              {formatNumber(yoctoToTgas(stats?.gas_price ?? '0'), 4)} Ⓝ
            </Skeleton>
          </StatValue>
          <StatLabel lgRight>Gas Price / Tgas</StatLabel>
        </StatBlock>
        <StatBlock>
          <StatValue lgRight smRight>
            <Skeleton className="skeleton-w-36" loading={loading}>
              {formatNumber(stats?.avg_block_time ?? '0', 4)}s
            </Skeleton>
          </StatValue>
          <StatLabel lgRight smRight>
            Avg. Block Time
          </StatLabel>
        </StatBlock>
      </Section>
    </Container>
  );
};

export default Stats;
