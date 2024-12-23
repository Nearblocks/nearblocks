import { useEffect } from 'react';

import { Network } from 'nb-types';

import Skeleton from '@/components/Skeleton';
import { useNetworkStore } from '@/stores/network';
import { SkeletonProps } from '@/types/types';
export const AddressKeysSkeleton = () => (
  <div className="relative overflow-auto">
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
        {[...Array(10).keys()].map((key) => (
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

export const AddressSkeleton = ({ network }: { network: string }) => {
  return (
    <div className="relative container mx-auto">
      <div className="pt-7 pb-[26px] px-5">
        <Skeleton
          className="h-[48px] lg:h-[54px] w-full overflow-hidden"
          loading
        >
          <h1 className="flex items-center font-heading font-medium text-[32px]lg:text-[36px] tracking-[0.1px] mr-4">
            &nbsp;
          </h1>
        </Skeleton>
      </div>
      <div className="sm:flex flex-wrap">
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Balance</h2>
          <Skeleton className="h-[39px] w-32" loading>
            <p className="font-heading font-medium text-[26px]">&nbsp;</p>
          </Skeleton>
        </div>
        {network === Network.MAINNET && (
          <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
            <h2 className="font-medium text-sm mb-0.5">Value</h2>
            <Skeleton className="h-[39px] w-32" loading>
              <p className="font-heading font-medium text-[26px]">&nbsp;</p>
            </Skeleton>
          </div>
        )}
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Validator Stake</h2>
          <Skeleton className="h-[39px] w-32" loading>
            <p className="font-heading font-medium text-[26px]">&nbsp;</p>
          </Skeleton>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
          <h2 className="font-medium text-sm mb-0.5">Storage Used</h2>
          <Skeleton className="h-[39px] w-32" loading>
            <p className="font-heading font-medium text-[26px]">&nbsp;</p>
          </Skeleton>
        </div>
        {network === Network.MAINNET && (
          <div className="w-full sm:w-1/2 lg:w-1/3 pl-5 mb-6 h-[60px]">
            <h2 className="font-medium text-sm mb-0.5">Type</h2>
            <Skeleton className="h-[39px] w-28" loading>
              <p className="font-heading font-medium text-[26px]">&nbsp;</p>
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
        <AddressKeysSkeleton />
      </div>
    </div>
  );
};

const AddressSkeletonWrapper = ({ onFinish }: SkeletonProps) => {
  useEffect(() => {
    return () => {
      if (onFinish) onFinish();
    };
  }, [onFinish]);
  const network = useNetworkStore((state) => state.network);

  return <AddressSkeleton network={network} />;
};

export default AddressSkeletonWrapper;
