import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { injected, walletConnect } from '@wagmi/connectors';
import { reconnect } from '@wagmi/core';
import type { CreateConnectorFn } from '@wagmi/core';

import { EVMWalletChain, networkId, projectId } from '@/utils/app/config';

// Config
const near = defineChain({
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: EVMWalletChain.explorer,
    },
  },
  caipNetworkId: `eip155:${EVMWalletChain.caipNetworkId}`,
  chainNamespace: `eip155`,
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
});
// Get your projectId at https://cloud.reown.com

const connectors: Array<CreateConnectorFn> = [
  walletConnect({
    metadata: {
      description: '',
      icons: [],
      name: '',
      url: '',
    },
    projectId,
    showQrModal: false, // showQrModal must be false
  }),
  injected({ shimDisconnect: true }),
];

export const wagmiAdapter = new WagmiAdapter({
  connectors,
  networks: [near],
  projectId,
});
// Preserve login state on page reload
reconnect(wagmiAdapter.wagmiConfig);
// Modal for login
export const web3Modal = createAppKit({
  adapters: [wagmiAdapter],
  allWallets: 'SHOW',
  coinbasePreference: 'eoaOnly', // Smart accounts (Safe contract) not available on NEAR Protocol, only EOA.
  defaultNetwork: near,
  enableWalletConnect: true,
  features: {
    analytics: true,
    email: false, // Smart accounts (Safe contract) not available on NEAR Protocol, only EOA.
    onramp: false,
    socials: false, // Smart accounts (Safe contract) not available on NEAR Protocol, only EOA.
    swaps: false,
  },
  networks: [near],
  projectId,
});
