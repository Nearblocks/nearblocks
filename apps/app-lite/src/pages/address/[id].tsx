import Big from 'big.js';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { RPC } from 'nb-near';

import AddressAccessKeys from '@/components/Address/AddressAccessKeys';
import Copy from '@/components/Common/Copy';
import Error from '@/components/Common/Error';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import Skeleton from '@/components/Skeleton';
import convertor from '@/libs/convertor';
import fetcher from '@/libs/fetcher';
import formatter from '@/libs/formatter';
import { getAccount } from '@/libs/rpc';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

interface AccountData {
  amount: string;
  block_hash: string;
  block_height: number;
  code_hash: string;
  locked: string;
  storage_paid_at: number;
  storage_usage: number;
}

interface Stats {
  change_24?: string;
  circulating_supply?: string;
  market_cap?: string;
  near_price?: string;
  total_supply?: string;
  volume?: string;
}

interface StatsResponse {
  stats?: Stats[];
}

const ACCOUNT_CODE_HASH = '11111111111111111111111111111111';

const Address: PageLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const rpcUrl = useRpcStore((state) => state.rpc);
  const providers = useNetworkStore((state) => state.providers);
  const network = useNetworkStore((state) => state.network);
  const { formatNumber, formatSize } = formatter();
  const { yoctoToNear } = convertor();
  const { apiFetch } = fetcher();
  const [address, setAddress] = useState<AccountData | null>(null);
  const [stats, setStats] = useState<null | Stats>(null);
  const [loading, setLoading] = useState({
    address: true,
    stats: true,
  });
  const [error, setError] = useState<null | string>(null);

  const value = formatNumber(
    Big(yoctoToNear(address?.amount ?? '0'))
      .mul(stats?.near_price ?? '0')
      .toString(),
    2,
  );
  const accountId = useMemo(() => {
    if (!id || Array.isArray(id)) return null;
    return id.trim();
  }, [id]);

  useEffect(() => {
    if (!apiFetch) return;
    setLoading((state) => ({ ...state, stats: true }));
    apiFetch<StatsResponse>(`https://api.nearblocks.io/v1/stats`)
      .then((response: StatsResponse) => {
        setStats(response?.stats?.[0] ?? null);
      })
      .catch(console.log)
      .finally(() => setLoading((state) => ({ ...state, stats: false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentRpcUrl = rpcUrl || providers?.[0]?.url;
    if (!currentRpcUrl || !accountId) return;

    let cancelled = false;

    const fetchAccountData = async () => {
      setLoading((state) => ({ ...state, address: true }));
      setError(null);

      try {
        const rpcEndpoint = new RPC(currentRpcUrl);
        const resp = await getAccount(rpcEndpoint, accountId);

        if (cancelled) return;

        if (resp?.result) {
          setAddress(resp.result);
        } else {
          setAddress(null);
          setError('Account not found');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching account data:', err);
        setAddress(null);
        setError('Failed to load account');
      } finally {
        if (!cancelled) setLoading((state) => ({ ...state, address: false }));
      }
    };

    fetchAccountData();

    return () => {
      cancelled = true;
    };
  }, [rpcUrl, providers, accountId]);

  return (
    <>
      <Meta
        description={`Near Account ${accountId} page allows users to view account details and access keys.`}
        title={`Near Account ${accountId} | Near Validate`}
      />
      {error && <Error title="Error Fetching Address" />}
      {!error && (
        <div className="relative container mx-auto">
          <div className="pt-7 pb-[26px] px-5">
            <Skeleton
              className="block h-[48px] lg:h-[54px] w-full"
              loading={loading.address}
            >
              <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
                <span className="truncate">{accountId}</span>
                <Copy
                  buttonClassName="ml-3"
                  className="text-primary w-6"
                  text={String(accountId)}
                />
              </h1>
            </Skeleton>
          </div>

          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Balance</h2>
              <Skeleton
                className="block h-[39px] w-32"
                loading={loading.address}
              >
                <p className="font-heading font-medium text-[26px]">
                  {formatNumber(yoctoToNear(address?.amount ?? '0'), 2)} Ⓝ
                </p>
              </Skeleton>
            </div>

            {network === 'mainnet' && (
              <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
                <h2 className="font-medium text-sm mb-0.5">Value</h2>
                <Skeleton
                  className="block h-[39px] w-32"
                  loading={loading.address || loading.stats}
                >
                  <p className="font-heading font-medium text-[26px]">
                    ${value}
                  </p>
                </Skeleton>
              </div>
            )}

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Validator Stake</h2>
              <Skeleton
                className="block h-[39px] w-32"
                loading={loading.address}
              >
                <p className="font-heading font-medium text-[26px]">
                  {formatNumber(yoctoToNear(address?.locked ?? '0'), 2)} Ⓝ
                </p>
              </Skeleton>
            </div>

            <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
              <h2 className="font-medium text-sm mb-0.5">Storage Used</h2>
              <Skeleton
                className="block h-[39px] w-32"
                loading={loading.address}
              >
                <p className="font-heading font-medium text-[26px]">
                  {formatSize(String(address?.storage_usage ?? 0), 2)}
                </p>
              </Skeleton>
            </div>

            {network === 'mainnet' && (
              <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
                <h2 className="font-medium text-sm mb-0.5">Type</h2>
                <Skeleton
                  className="block h-[39px] w-28"
                  loading={loading.address}
                >
                  <p className="font-heading font-medium text-[24px]">
                    {address?.code_hash === ACCOUNT_CODE_HASH
                      ? 'Account'
                      : 'Contract'}
                  </p>
                </Skeleton>
              </div>
            )}
          </div>

          <div className="bg-bg-box lg:rounded-xl shadow mt-8">
            <div className="pt-4 pb-6 mx-6">
              <button className="font-medium border-b-[3px] border-text-body py-1 mr-4">
                Access Keys
              </button>
            </div>
            <AddressAccessKeys id={String(accountId)} rpcUrl={rpcUrl} />
          </div>
        </div>
      )}
    </>
  );
};

Address.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Address;
