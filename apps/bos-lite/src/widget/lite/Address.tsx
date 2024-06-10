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

let Skeleton = window?.Skeleton || (({ children }) => <>{children}</>);

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

  yoctoToNear = yoctoToNear || (() => <></>);
  formatNumber = formatNumber || (() => <></>);
  formatSize = formatSize || (() => <></>);

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
      rpcFetch<RpcResultAccount>(rpcUrl, 'query', {
        account_id: id,
        finality: 'final',
        request_type: 'view_account',
      })
        .then((response) => setAddress(response))
        .catch(setError)
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, address: false })),
        );
    }

    if (apiFetch) {
      apiFetch<StatsResponse>(`${alias_api_url}/stats`)
        .then((response) => setStats(response?.stats?.[0]))
        .catch(console.log)
        .finally(() =>
          setLoading((state: Loading) => ({ ...state, stats: false })),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rpcUrl]);

  const KeysLoader = () => (
    <div className="relative rounded-lg overflow-auto bg-bg-box border border-border-body my-6">
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="w-[300px] font-normal text-xs text-text-label uppercase text-left pl-6 pr-4 py-4">
              Public Key
            </th>
            <th className="w-[84px] font-normal text-xs text-text-label uppercase text-left px-4 py-4">
              Access
            </th>
            <th className="w-[160px] font-normal text-xs text-text-label uppercase text-left px-4 py-4">
              Contract
            </th>
            <th className="w-[240px] font-normal text-xs text-text-label uppercase text-left px-4 py-4">
              Methods
            </th>
            <th className="w-[112px] font-normal text-xs text-text-label uppercase text-left pl-4 pr-6 py-4">
              Allowance
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-6" colSpan={5}>
              <span className="block w-full border-b border-b-border-body" />
            </td>
          </tr>
          {[...Array(25).keys()].map((key) => (
            <tr key={key}>
              <td className="h-[46px] pl-6 pr-4 py-4">
                <span className="flex">
                  <Skeleton className="h-5 w-[190px]" loading>
                    &nbsp;
                  </Skeleton>
                </span>
              </td>
              <td className="h-[46px] px-4 py-4">
                <span className="flex">
                  <Skeleton className="h-5 w-[64px]" loading>
                    &nbsp;
                  </Skeleton>
                </span>
              </td>
              <td className="h-[46px] px-4 py-4">
                <span className="flex">
                  <Skeleton className="h-5 w-[100px]" loading>
                    &nbsp;
                  </Skeleton>
                </span>
              </td>
              <td className="h-[46px] px-4 py-4">
                <span className="flex">
                  <Skeleton className="h-5 w-[160px]" loading>
                    &nbsp;
                  </Skeleton>
                </span>
              </td>
              <td className="h-[46px] pl-4 pr-6 py-4">
                <span className="flex">
                  <Skeleton className="h-5 w-[64px]" loading>
                    &nbsp;
                  </Skeleton>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (error) {
    return (
      <Widget<ErrorProps>
        key="error"
        props={{ title: 'Error Fetching Address' }}
        src={`${config_account}/widget/lite.Atoms.Error`}
      />
    );
  }

  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton className="block h-[54px] w-full" loading={loading.address}>
          <h1 className="flex items-center font-heading font-medium text-[36px] tracking-[0.1px] mr-4">
            <span className="truncate">{id}</span>
            <Widget<CopyProps>
              key="copy"
              props={{
                buttonClassName: 'ml-3',
                className: 'text-primary w-6',
                text: id,
              }}
              src={`${config_account}/widget/lite.Atoms.Copy`}
            />
          </h1>
        </Skeleton>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Balance</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading.address}>
            <p className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToNear(address?.amount ?? '0'), 2)} Ⓝ
            </p>
          </Skeleton>
        </div>
        {context.networkId === 'mainnet' && (
          <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
            <h2 className="font-medium text-sm mb-0.5">Value</h2>
            <Skeleton
              className="block h-[39px] w-32"
              loading={loading.address || loading.stats}
            >
              <p className="font-heading font-medium text-[26px]">${value}</p>
            </Skeleton>
          </div>
        )}
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Validator Stake</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading.address}>
            <p className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToNear(address?.locked ?? '0'), 2)} Ⓝ
            </p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Storage Used</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading.address}>
            <p className="font-heading font-medium text-[26px]">
              {formatSize(String(address?.storage_usage ?? 0), 2)}
            </p>
          </Skeleton>
        </div>
        {context.networkId === 'mainnet' && (
          <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
            <h2 className="font-medium text-sm mb-0.5">Type</h2>
            <Skeleton className="block h-[39px] w-28" loading={loading.address}>
              <p className="font-heading font-medium text-[24px]">
                {address?.code_hash === ACCOUNT_CODE_HASH
                  ? 'Account'
                  : 'Contract'}
              </p>
            </Skeleton>
          </div>
        )}
      </div>
      <div className="px-5 my-8">
        <button className="font-bold border-b-[3px] border-text-body py-1">
          Access Keys
        </button>
        <Widget<KeysProps>
          key="keys"
          loading={<KeysLoader />}
          props={{ id, rpcUrl }}
          src={`${config_account}/widget/lite.Address.Keys`}
        />
      </div>
    </div>
  );
};

export default Address;
