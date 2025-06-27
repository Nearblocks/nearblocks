'use client';

import { useState, useEffect } from 'react';
import SponsoredText from '@/components/app/SponsoredText';
import { AccountDataInfo, TextAdData } from '@/utils/types';
import { useParams } from 'next/navigation';
import { useAddressRpc } from '../common/AddressRpcProvider';

interface AddressValidatorProps {
  sponsoredText?: TextAdData;
  accountData?: { account: AccountDataInfo[] };
}

const AddressValidator = ({
  sponsoredText,
  accountData,
}: AddressValidatorProps) => {
  const params = useParams<{ id: string }>();
  const accountId = accountData?.account?.[0]?.account_id;
  const [accountValid, setAccountValid] = useState<boolean>(
    () => accountId === params?.id?.toLowerCase(),
  );
  const { account: accountRpc, isLoading } = useAddressRpc();
  const [loading, setIsloading] = useState(!accountId && isLoading);

  useEffect(() => {
    if (accountId == null) {
      if (!isLoading) {
        if (accountRpc) {
          const isNonEmpty = !!Object.keys(accountRpc).length;
          setAccountValid(isNonEmpty);
        } else {
          setAccountValid(false);
        }
        setIsloading(false);
      } else {
        setIsloading(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, accountRpc, isLoading]);

  return (
    <div className="container-xxl text-sm dark:text-neargray-10 text-nearblue-600">
      <div>
        {accountValid
          ? sponsoredText && (
              <div className="pl-1.5 pb-4 pt-2 min-h-[25px]">
                <SponsoredText sponsoredText={sponsoredText} />
              </div>
            )
          : !loading && (
              <div className="pl-1.5 pb-4 pt-2 min-h-[25px]">
                This address does not exist.
              </div>
            )}
      </div>
    </div>
  );
};

export default AddressValidator;
