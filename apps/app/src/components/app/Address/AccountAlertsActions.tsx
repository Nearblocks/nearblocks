'use client';
import { use } from 'react';
import { convertToUTC, nanoToMilli } from '@/utils/app/libs';
import { TextAdData } from '@/utils/types';

import WarningIcon from '@/components/app/Icons/WarningIcon';
import SponsoredText from '@/components/app/SponsoredText';
import AddressValidator from '@/components/app/Address/AddressValidator';
import { useAddressRpc } from '../common/AddressRpcProvider';
const AccountAlertsActions = ({
  accountDataPromise,
  sponsoredText,
}: {
  accountDataPromise: Promise<any>;
  sponsoredText?: TextAdData;
}) => {
  const data = use(accountDataPromise);
  const accountData = data?.message === 'Error' ? null : data;
  const { account, contractInfo, accessKeys, isLocked, isLoading } =
    useAddressRpc();

  if (!isLoading && !isLocked && sponsoredText) {
    return (
      <div className="container-xxl text-sm dark:text-neargray-10 text-nearblue-600">
        <div>
          <div className="pl-1.5 py-4 min-h-[25px]">
            <SponsoredText sponsoredText={sponsoredText} />
          </div>
        </div>
      </div>
    );
  }

  if (
    !account &&
    accountData?.account?.[0]?.deleted?.transaction_hash &&
    !isLoading
  ) {
    return (
      <>
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full">
            <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
              <p className="mb-0 items-center break-words">
                <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                {`This account was deleted on ${
                  accountData?.account?.[0]?.deleted?.transaction_hash
                    ? convertToUTC(
                        nanoToMilli(
                          accountData?.account?.[0]?.deleted?.block_timestamp,
                        ),
                        false,
                      )
                    : ''
                }`}
              </p>
            </div>
          </div>
        </div>
        <div className="py-1"></div>
      </>
    );
  }

  if (
    account !== null &&
    isLocked &&
    accountData?.account?.[0]?.deleted?.transaction_hash == null &&
    accessKeys &&
    Object.keys(accessKeys)?.length === 0 &&
    contractInfo === null &&
    !isLoading
  ) {
    return (
      <>
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full">
            <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
              <p className="mb-0 items-center">
                <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                This account has no full access keys
              </p>
            </div>
          </div>
        </div>
        <div className="py-1"></div>
      </>
    );
  }
  return <AddressValidator accountData={accountData} />;
};

export default AccountAlertsActions;
