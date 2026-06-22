import Link from 'next/link';
import React from 'react';

import Copy from '@/components/Common/Copy';
import Tooltip from '@/components/Common/Tooltip';
import { shortenString } from '@/libs/utils';

const TxnAddress = ({ address }: { address: string }) => {
  return (
    <div className="flex items-center pb-3">
      <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3" />
      <span className="flex font-heading font-semibold text-sm group">
        <Link href={`/address/${address}`}>
          {address.length > 22 ? (
            <Tooltip tooltip={address}>
              {shortenString(String(address), 10, 10, 22)}
            </Tooltip>
          ) : (
            address
          )}
        </Link>
        <Copy
          buttonClassName="ml-2"
          className="hidden text-primary w-3.5 group-hover:block"
          text={address}
        />
      </span>
    </div>
  );
};

export default TxnAddress;
