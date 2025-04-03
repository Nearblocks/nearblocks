'use client';

import { useState, useEffect } from 'react';
import useRpc from '@/hooks/app/useRpc';
import SponsoredText from '../SponsoredText';
import { AccountDataInfo, TextAdData } from '@/utils/types';
import { useParams } from 'next/navigation';
import { useRpcStore } from '@/stores/app/rpc';

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
  const { viewAccount } = useRpc();

  const rpcUrl: any = useRpcStore((state) => state.rpc);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);

  useEffect(() => {
    if (accountId == null) {
      viewAccount(params?.id)
        .then((account) => setAccountValid(!!account))
        .catch(() => {
          setAccountValid(false);
          switchRpc();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, accountData, rpcUrl]);

  if (accountValid === null) {
    return null;
  }
  return (
    <div className="container-xxl text-sm dark:text-neargray-10 text-nearblue-600">
      <div>
        {accountValid ? (
          sponsoredText && (
            <div className="pl-1.5 pb-4 pt-2 min-h-[25px]">
              <SponsoredText sponsoredText={sponsoredText} />
            </div>
          )
        ) : (
          <div className="pl-1.5 pb-4 pt-2 min-h-[25px]">
            This address does not exist.
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressValidator;
