import type { RpcResultAccount } from 'nb-near';

import type { KeysProps } from '@/Address/Keys';
import type { CopyProps } from '@/Atoms/Copy';
import type { ErrorProps } from '@/Atoms/Error';
import type { ConvertorModule } from '@/libs/convertor';
import type { FetcherModule } from '@/libs/fetcher';
import type { FormatterModule } from '@/libs/formatter';
import type { Stats, StatsResponse } from '@/types/types';

type AddressProps = {
  id: string;
  rpcUrl: string;
};

type Loading = {
  address: boolean;
  stats: boolean;
};

let ErrorSkeleton = window?.ErrorSkeleton || (() => <></>);
let AddressSkeleton = window?.AddressSkeleton || (() => <></>);
let AddressKeysSkeleton = window?.AddressKeysSkeleton || (() => <></>);
let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

const Container = styled.div`
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
  .addressSkeleton {
    display: block;
    height: 48px;
    @media (min-width: 1024px) {
      height: 54px;
    }
    width: 100%;
  }
`;
const AddressContainer = styled.div`
  padding-top: 1.75rem;
  padding-bottom: 26px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
`;

const AddressHeading = styled.h1`
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

const StatsContainer = styled.div`
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
const StatsDataContainer = styled.div`
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
`;

const StatsDataHeading = styled.h2`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.125rem;
`;
const SatsData = styled.p<{ fsize?: string }>`
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: ${(props: any) => (props.fsize ? props.fsize : '')};
`;

const AccesskeyContainer = styled.div`
  background-color: rgb(var(--color-bg-box));
  @media (min-width: 1024px) {
    border-radius: 0.75rem;
  }
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color),
    0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  margin-top: 2rem;
`;
const AccesskeyHeading = styled.div`
  padding-top: 1rem;
  padding-bottom: 1.5rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;
const Button = styled.button`
  font-weight: 500;
  border-bottom-width: 3px;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-right: 1rem;
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  border-top: none;
  border-left: none;
  border-right: none;
`;

const Address = ({ id, rpcUrl }: AddressProps) => {
  let { apiFetch, rpcFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  let { yoctoToNear } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber, formatSize } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );

  if (!apiFetch || !rpcFetch || !yoctoToNear || !formatNumber || !formatSize)
    return <AddressSkeleton />;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<Loading>({
    address: true,
    stats: true,
  });
  const [stats, setStats] = useState<null | Stats>(null);
  const [address, setAddress] = useState<null | RpcResultAccount>(null);

  const ACCOUNT_CODE_HASH = '11111111111111111111111111111111';
  const value = formatNumber(
    Big(yoctoToNear(address?.amount ?? '0'))
      .mul(stats?.near_price ?? '0')
      .toString(),
    2,
  );

  useEffect(() => {
    if (rpcFetch && rpcUrl && id) {
      setLoading((state: Loading) => ({ ...state, address: true }));
      rpcFetch<RpcResultAccount>(rpcUrl, 'query', {
        account_id: id,
        finality: 'final',
        request_type: 'view_account',
      })
        .then((response) => {
          setAddress(response);
          setError(null);
        })
        .catch(setError)
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, address: false })),
        );
    }

    if (apiFetch) {
      setLoading((state: Loading) => ({ ...state, stats: true }));
      apiFetch<StatsResponse>(`${alias_api_url}/stats`)
        .then((response) => setStats(response?.stats?.[0]))
        .catch(console.log)
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, stats: false })),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rpcUrl]);

  if (error) {
    return (
      <Widget<ErrorProps>
        key="error"
        loading={<ErrorSkeleton />}
        props={{ title: 'Error Fetching Address' }}
        src={`${config_account}/widget/lite.Atoms.Error`}
      />
    );
  }

  return (
    <Container>
      <AddressContainer>
        <Skeleton className="addressSkeleton" loading={loading.address}>
          <AddressHeading>
            <span className="headingSpan">{id}</span>
            <Widget<CopyProps>
              key="copy"
              props={{
                buttonClassName: 'copyButton',
                className: 'copyClass',
                text: id,
              }}
              src={`${config_account}/widget/lite.Atoms.Copy`}
            />
          </AddressHeading>
        </Skeleton>
      </AddressContainer>
      <StatsContainer>
        <StatsDataContainer>
          <StatsDataHeading>Balance</StatsDataHeading>
          <Skeleton className="statsSkeleton" loading={loading.address}>
            <SatsData fsize="26px">
              {formatNumber(yoctoToNear(address?.amount ?? '0'), 2)} Ⓝ
            </SatsData>
          </Skeleton>
        </StatsDataContainer>
        {context.networkId === 'mainnet' && (
          <StatsDataContainer>
            <StatsDataHeading>Value</StatsDataHeading>
            <Skeleton
              className="statsSkeleton"
              loading={loading.address || loading.stats}
            >
              <SatsData fsize="26px">${value}</SatsData>
            </Skeleton>
          </StatsDataContainer>
        )}
        <StatsDataContainer>
          <StatsDataHeading>Validator Stake</StatsDataHeading>
          <Skeleton className="statsSkeleton" loading={loading.address}>
            <SatsData fsize="26px">
              {formatNumber(yoctoToNear(address?.locked ?? '0'), 2)} Ⓝ
            </SatsData>
          </Skeleton>
        </StatsDataContainer>
        <StatsDataContainer>
          <StatsDataHeading>Storage Used</StatsDataHeading>
          <Skeleton className="statsSkeleton" loading={loading.address}>
            <SatsData fsize="26px">
              {formatSize(String(address?.storage_usage ?? 0), 2)}
            </SatsData>
          </Skeleton>
        </StatsDataContainer>
        {context.networkId === 'mainnet' && (
          <StatsDataContainer>
            <StatsDataHeading>Type</StatsDataHeading>
            <Skeleton className="statsSkeletonType" loading={loading.address}>
              <SatsData fsize="24px">
                {address?.code_hash === ACCOUNT_CODE_HASH
                  ? 'Account'
                  : 'Contract'}
              </SatsData>
            </Skeleton>
          </StatsDataContainer>
        )}
      </StatsContainer>
      <AccesskeyContainer>
        <AccesskeyHeading>
          <Button>Access Keys</Button>
        </AccesskeyHeading>
        <Widget<KeysProps>
          key="keys"
          loading={<AddressKeysSkeleton />}
          props={{ id, rpcUrl }}
          src={`${config_account}/widget/lite.Address.Keys`}
        />
      </AccesskeyContainer>
    </Container>
  );
};

export default Address;
