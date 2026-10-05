import Link from 'next/link';

import Tooltip from '@/components/Atoms/Tooltip';
import CopyButton from '@/components/CopyButton';
import Skeleton from '@/components/Skeleton';
import { shortenString } from '@/libs/txn';

type AddressProps = {
  address?: string;
};

const Address = ({ address }: AddressProps) => {
  if (address === undefined) {
    return (
      <div className="flex items-center pb-3">
        <span className="inline-block h-4 w-4 rounded-full bg-bg-skeleton mr-3" />
        <Skeleton className="block h-5 w-28" loading>
          <span className="font-heading font-semibold text-sm">&nbsp;</span>
        </Skeleton>
      </div>
    );
  }

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
        <CopyButton
          buttonClassName="w-4 ml-1"
          className="hidden text-primary w-3.5 group-hover:block"
          text={address}
        />
      </span>
    </div>
  );
};

export default Address;
