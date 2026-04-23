'use client';

import { useTranslations } from 'next-intl';
import React, { ReactNode, use } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { dollarFormat, fiatValue, yoctoToNear } from '@/utils/app/libs';
import { StatusInfo, Status } from '@/utils/types';
import FaExternalLinkAlt from '@/components/app/Icons/FaExternalLinkAlt';
import { useAddressRpc } from '../common/AddressRpcProvider';
import useStatsStore from '@/stores/app/syncStats';
import Skeleton from '@/components/app/skeleton/common/Skeleton';

const AccountOverviewActions = ({
  accountDataPromise,
  statsDataPromise,
  tokenDataPromise,
  syncDataPromise,
  children,
}: {
  accountDataPromise: Promise<any>;
  statsDataPromise: Promise<{ stats: StatusInfo[] }>;
  tokenDataPromise: Promise<any>;
  syncDataPromise: Promise<{ status: Status }>;
  children?: ReactNode;
}) => {
  const account = use(accountDataPromise);
  const syncData = use(syncDataPromise);
  const stats = use(statsDataPromise);
  const token = use(tokenDataPromise);
  const accountData = account?.account?.[0];
  const statsData = useStatsStore((state) => state.latestStats);
  const tokenData = token?.contracts?.[0];
  const { account: accountView } = useAddressRpc();
  const t = useTranslations();
  const { networkId } = useConfig();
  const indexers = useStatsStore((state) => state.syncStatus);
  const status =
    indexers?.balance?.sync ?? syncData?.status?.indexers?.balance?.sync;

  const balance = status ? accountData?.amount : accountView?.amount;
  const nearPrice = statsData?.near_price ?? stats?.stats?.[0]?.near_price;

  return (
    <div className="w-full">
      <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
        <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
          <h2 className="leading-6 text-sm font-semibold">
            {t('overview') || 'Overview'}
          </h2>
          {tokenData?.name && (
            <div className="flex items-center text-xs bg-gray-100 dark:bg-black-200 dark:text-neargray-10 rounded-md px-2 py-1">
              <div className="truncate max-w-[110px]">{tokenData?.name}</div>
              {tokenData?.website && (
                <a
                  className="ml-1"
                  href={tokenData?.website}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  <FaExternalLinkAlt />
                </a>
              )}
            </div>
          )}
        </div>
        <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
          <div className="xl:flex flex-wrap xl:flex-nowrap py-4">
            <div className="w-36 xl:mb-0 mb-1.5">
              {t('balance') || 'Balance'}:
            </div>

            <div className="w-full break-words">
              {balance != null ? (
                yoctoToNear(balance, true) + ' Ⓝ'
              ) : (
                <Skeleton className="h-4 w-32" />
              )}
            </div>
          </div>
          {networkId === 'mainnet' && (
            <div className="xl:flex flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="w-36 xl:mb-0 mb-1.5">
                {t('value') || 'Value:'}
              </div>

              <div className="w-full break-words flex items-center">
                {balance == null || nearPrice == null ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    <span>
                      {'$' +
                        fiatValue(yoctoToNear(balance, false), nearPrice) +
                        ' '}
                    </span>
                    <span className="text-xs">
                      (@{'$' + dollarFormat(nearPrice)} / Ⓝ)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="xl:flex flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10 w-full">
            <div className="w-36 xl:mb-0 mb-1.5">
              {t('tokens') || 'Tokens:'}
            </div>
            <div className="break-words -my-1 z-10 flex w-full">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewActions;
