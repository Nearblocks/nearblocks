import type { EIP1193Provider } from '@web3-onboard/core';
import { useConnectWallet } from '@web3-onboard/react';
import { singletonHook } from 'react-singleton-hook';

type EthersProviderContext = {
  provider?: EIP1193Provider;
  useConnectWallet: typeof useConnectWallet;
};

const defaultEthersProviderContext: EthersProviderContext = {
  useConnectWallet,
};

export const useEthersProviderContext = singletonHook(
  defaultEthersProviderContext,
  () => {
    return null;
  },
);
