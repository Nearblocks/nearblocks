import Arbitrum from '@/components/app/Icons/Arbitrum';
import Base from '@/components/app/Icons/Base';
import Bitcoin from '@/components/app/Icons/Bitcoin';
import Doge from '@/components/app/Icons/Doge';
import Ethereum from '@/components/app/Icons/Ethereum';
import Solana from '@/components/app/Icons/Solana';
import XRP from '@/components/app/Icons/XRP';
import React from 'react';

type NetworkIconsProps = {
  network: string | undefined;
  className?: string;
};

export const useNetworkIcons = ({
  network,
  className = 'w-4 h-4',
}: NetworkIconsProps) => {
  switch (network) {
    case 'bitcoin':
      return <Bitcoin className={`${className} text-orange-400`} />;
    case 'ethereum':
      return (
        <Ethereum
          className={`${className} text-black-200 dark:text-neargray-10`}
        />
      );
    case 'solana':
      return <Solana className="w-3 h-4" />;
    case 'arbitrum':
      return <Arbitrum className={className} />;
    case 'doge':
      return <Doge className={className} />;
    case 'xrp':
      return <XRP className={className} />;
    case 'base':
      return <Base className={`${className} dark:!invert`} />;
    default:
      return null;
  }
};
