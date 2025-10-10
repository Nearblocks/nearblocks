import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { injected, walletConnect } from '@wagmi/connectors';
import { reconnect } from '@wagmi/core';
import type { CreateConnectorFn } from '@wagmi/core';

import { projectId } from '@/utils/app/config';

const nearTestnet = defineChain({
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: 'https://testnet.nearblocks.io',
    },
  },
  caipNetworkId: `eip155:398`,
  chainNamespace: `eip155`,
  id: 398,
  name: 'Near Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: { http: ['https://eth-rpc.testnet.near.org'] },
    public: { http: ['https://eth-rpc.testnet.near.org'] },
  },
  testnet: true,
});

const connectors: Array<CreateConnectorFn> = [
  walletConnect({
    metadata: {
      description: '',
      icons: [],
      name: '',
      url: '',
    },
    projectId: projectId,
    showQrModal: false,
  }),
  injected({ shimDisconnect: true }),
];

export const wagmiAdapterTestnet = new WagmiAdapter({
  connectors,
  networks: [nearTestnet],
  projectId: projectId,
});
reconnect(wagmiAdapterTestnet.wagmiConfig);

export const web3ModalTestnet = createAppKit({
  adapters: [wagmiAdapterTestnet],
  allWallets: 'SHOW',
  coinbasePreference: 'eoaOnly',
  defaultNetwork: nearTestnet,
  enableWalletConnect: true,
  allowUnsupportedChain: true,
  features: {
    analytics: false,
    email: false,
    onramp: false,
    socials: false,
    swaps: false,
  },
  networks: [nearTestnet],
  projectId: projectId,
});
