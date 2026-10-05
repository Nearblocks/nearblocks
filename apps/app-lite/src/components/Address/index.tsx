import Big from 'big.js';
import { useEffect, useState } from 'react';

import type { RpcResultAccount } from 'nb-near';
import { Network } from 'nb-types';

import ErrorState from '@/components/Atoms/Error';
import CopyButton from '@/components/CopyButton';
import Skeleton from '@/components/Skeleton';
import { createCache } from '@/libs/cache';
import { yoctoToNear } from '@/libs/convertor';
import { apiFetch, getApiUrl, rpcFetch } from '@/libs/fetcher';
import { formatNumber, formatSize } from '@/libs/formatter';
import type { StatsResponse } from '@/types/types';

import Keys from './Keys';

type AddressProps = {
  id?: string;
  network: string;
  rpcUrl: string;
};

const priceCache = createCache<string>(60_000, 2);
const ACCOUNT_CODE_HASH = '11111111111111111111111111111111';

const Address = ({ id, network, rpcUrl }: AddressProps) => {
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<null | RpcResultAccount>(null);
  const [price, setPrice] = useState('0');
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceFailed, setPriceFailed] = useState(false);

  const value = formatNumber(
    Big(yoctoToNear(address?.amount ?? '0'))
      .mul(price)
      .toString(),
    2,
  );

  useEffect(() => {
    if (network !== Network.MAINNET) return;

    const cached = priceCache.get(network);

    if (cached !== undefined) {
      setPrice(cached);
      setPriceLoading(false);

      return;
    }

    const controller = new AbortController();

    setPriceFailed(false);
    setPriceLoading(true);
    apiFetch<StatsResponse>(`${getApiUrl(network)}/stats`, {
      signal: controller.signal,
    })
      .then((response) => {
        const nearPrice = response?.stats?.[0]?.near_price ?? '0';

        priceCache.set(network, nearPrice);
        setPrice(nearPrice);
      })
      .catch(() => !controller.signal.aborted && setPriceFailed(true))
      .finally(() => !controller.signal.aborted && setPriceLoading(false));

    return () => controller.abort();
  }, [network]);

  useEffect(() => {
    if (!rpcUrl || !id) return;

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    rpcFetch<RpcResultAccount>(
      rpcUrl,
      'query',
      { account_id: id, finality: 'final', request_type: 'view_account' },
      { signal },
    )
      .then((response) => {
        setAddress(response);
        setError(null);
      })
      .catch((err) => !signal.aborted && setError(err))
      .finally(() => !signal.aborted && setLoading(false));

    return () => controller.abort();
  }, [id, rpcUrl]);

  if (error) return <ErrorState title="Error Fetching Address" />;

  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton
          className="block h-[48px] lg:h-[54px] w-full"
          loading={loading}
        >
          <h1 className="flex items-center font-heading font-medium text-[32px] lg:text-[36px] tracking-[0.1px] mr-4">
            <span className="truncate">{id}</span>
            <CopyButton
              buttonClassName="ml-3"
              className="text-primary w-6"
              text={id ?? ''}
            />
          </h1>
        </Skeleton>
      </div>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Balance</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading}>
            <p className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToNear(address?.amount ?? '0'), 2)} Ⓝ
            </p>
          </Skeleton>
        </div>
        {network === Network.MAINNET && (
          <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
            <h2 className="font-medium text-sm mb-0.5">Value</h2>
            <Skeleton
              className="block h-[39px] w-32"
              loading={loading || priceLoading}
            >
              <p className="font-heading font-medium text-[26px]">
                {priceFailed ? '-' : `$${value}`}
              </p>
            </Skeleton>
          </div>
        )}
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Validator Stake</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading}>
            <p className="font-heading font-medium text-[26px]">
              {formatNumber(yoctoToNear(address?.locked ?? '0'), 2)} Ⓝ
            </p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Storage Used</h2>
          <Skeleton className="block h-[39px] w-32" loading={loading}>
            <p className="font-heading font-medium text-[26px]">
              {formatSize(String(address?.storage_usage ?? 0), 2)}
            </p>
          </Skeleton>
        </div>
        {network === Network.MAINNET && (
          <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
            <h2 className="font-medium text-sm mb-0.5">Type</h2>
            <Skeleton className="block h-[39px] w-28" loading={loading}>
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
        <Keys id={id} rpcUrl={rpcUrl} />
      </div>
    </div>
  );
};

export default Address;
