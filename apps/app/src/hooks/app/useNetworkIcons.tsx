import Arbitrum from '@/components/app/Icons/Arbitrum';
import Base from '@/components/app/Icons/Base';
import Bitcoin from '@/components/app/Icons/Bitcoin';
import Ethereum from '@/components/app/Icons/Ethereum';
import Solana from '@/components/app/Icons/Solana';
import React from 'react';
import { DestinationChain } from 'nb-types';
import BSCTrace from '@/components/app/Icons/BSCTrace';
import Gnosis from '@/components/app/Icons/Gnosis';
import Optimism from '@/components/app/Icons/Optimism';
import Polygon from '@/components/app/Icons/Polygon';
type NetworkIconsProps = {
  network: DestinationChain;
  className?: string;
};

export const useNetworkIcons = ({
  network,
  className = 'w-4 h-4',
}: NetworkIconsProps) => {
  switch (network) {
    case DestinationChain.BITCOIN:
      return <Bitcoin className={`${className} text-orange-400`} />;
    case DestinationChain.ETHEREUM:
      return (
        <Ethereum
          className={`${className} text-black-200 dark:text-neargray-10`}
        />
      );
    case DestinationChain.SOLANA:
      return <Solana className="w-3 h-4" />;
    case DestinationChain.ARBITRUM:
      return <Arbitrum className={className} />;
    case DestinationChain.BASE:
      return <Base className={`${className} dark:!invert`} />;
    case DestinationChain.BSC:
      return <BSCTrace />;
    case DestinationChain.GNOSIS:
      return <Gnosis />;
    case DestinationChain.OPTIMISM:
      return <Optimism />;
    case DestinationChain.POLYGON:
      return <Polygon />;
    default:
      return null;
  }
};
