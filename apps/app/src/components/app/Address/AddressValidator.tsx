'use client';

import { useState, useEffect } from 'react';
import useRpc from '@/hooks/app/useRpc';
import SponsoredText from '../SponsoredText';
import { AccountDataInfo, TextAdData } from '@/utils/types';

interface AddressValidatorProps {
  id: string;
  sponsoredText?: TextAdData;
  accountData?: AccountDataInfo;
}

const AddressValidator = ({
  id,
  sponsoredText,
  accountData,
}: AddressValidatorProps) => {
  const [accountValid, setAccountValid] = useState(
    () => accountData?.account_id === id,
  );
  const { viewAccount } = useRpc();

  useEffect(() => {
    if (accountData?.account_id !== id) {
      viewAccount(id)
        .then((account) => setAccountValid(!!account))
        .catch(() => setAccountValid(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accountData]);

  if (accountValid === null) {
    return null;
  }

  return (
    <div className="container-xxl text-sm dark:text-neargray-10 text-nearblue-600">
      <div>
        {accountValid ? (
          sponsoredText && (
            <div className="pl-1.5 py-4 min-h-[25px]">
              <SponsoredText sponsoredText={sponsoredText} />
            </div>
          )
        ) : (
          <div className="pl-1.5 py-4 min-h-[25px]">
            This address does not exist.
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressValidator;
