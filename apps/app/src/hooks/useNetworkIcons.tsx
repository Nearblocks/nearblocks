import Arbitrum from '@/components/Icons/Networks/Arbitrum';
import Base from '@/components/Icons/Networks/Base';
import Bitcoin from '@/components/Icons/Networks/Bitcoin';
import Doge from '@/components/Icons/Networks/Doge';
import Ethereum from '@/components/Icons/Networks/Ethereum';
import Solana from '@/components/Icons/Networks/Solana';
import XRP from '@/components/Icons/Networks/XRP';
import React from 'react';

type NetworkIconsProps = {
  network: string | undefined;
  className?: string;
};

export const useNetworkIcons = ({
  network,
  className = 'w-4 h-4',
}: NetworkIconsProps) => {
  console.log({ network });
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
