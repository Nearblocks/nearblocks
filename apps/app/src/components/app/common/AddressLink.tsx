import Link from 'next/link';
import React from 'react';

import { shortenAddress } from '@/utils/app/libs';

type Props = {
  address: string;
  className?: string;
  currentAddress: string;
  href?: string;
  name?: React.ReactNode | string;
  onMouseLeave: () => void;
  onMouseOver: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  target?: string;
};

const AddressLink = ({
  address,
  className,
  currentAddress,
  href,
  name,
  onMouseLeave,
  onMouseOver,
  target,
}: Props) => {
  const isActive = currentAddress === address;

  return (
    <Link
      className={`text-green-500 dark:text-green-250 hover:no-underline p-0.5 px-1 border rounded-md ${
        className ? className : ''
      } ${
        isActive
          ? 'bg-amber border-amber dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-green-600'
          : 'text-green-500 dark:text-green-250 border-transparent'
      }`}
      href={href ? href : `/address/${currentAddress}`}
      onMouseLeave={onMouseLeave}
      onMouseOver={(e) => onMouseOver(e, currentAddress)}
      target={target ? target : '_self'}
    >
      {name ? name : shortenAddress(currentAddress)}
    </Link>
  );
};

export default AddressLink;
