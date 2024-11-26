import { injected, walletConnect } from '@wagmi/connectors';
import { createConfig, http, reconnect } from '@wagmi/core';
import { createWeb3Modal } from '@web3modal/wagmi';

import { EVMWalletChain, networkId } from '@/utils/app/config';

// Config
const near = {
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: EVMWalletChain.explorer,
    },
  },
  id: EVMWalletChain.chainId,
  name: EVMWalletChain.name,
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: { http: [EVMWalletChain.rpc] },
    public: { http: [EVMWalletChain.rpc] },
  },
  testnet: networkId === 'testnet',
};

// Get your projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [near],
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected({ shimDisconnect: true }),
  ],
  transports: { [near.id]: http() },
});

// Preserve login state on page reload
reconnect(wagmiConfig, { connectors: [injected({ shimDisconnect: true })] });

// Modal for login
export const web3Modal = createWeb3Modal({ projectId, wagmiConfig });
