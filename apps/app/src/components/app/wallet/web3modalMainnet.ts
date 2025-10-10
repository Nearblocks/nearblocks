import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { injected, walletConnect } from '@wagmi/connectors';
import { reconnect } from '@wagmi/core';
import type { CreateConnectorFn } from '@wagmi/core';

import { projectId } from '@/utils/app/config';

const nearMainnet = defineChain({
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: 'https://nearblocks.io',
    },
  },
  caipNetworkId: `eip155:397`,
  chainNamespace: `eip155`,
  id: 397,
  name: 'Near Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: { http: ['https://eth-rpc.mainnet.near.org'] },
    public: { http: ['https://eth-rpc.mainnet.near.org'] },
  },
  testnet: false,
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

export const wagmiAdapterMainnet = new WagmiAdapter({
  connectors,
  networks: [nearMainnet],
  projectId: projectId,
});
reconnect(wagmiAdapterMainnet.wagmiConfig);

export const web3ModalMainnet = createAppKit({
  adapters: [wagmiAdapterMainnet],
  allWallets: 'SHOW',
  coinbasePreference: 'eoaOnly',
  defaultNetwork: nearMainnet,
  enableWalletConnect: true,
  allowUnsupportedChain: true,
  features: {
    analytics: false,
    email: false,
    onramp: false,
    socials: false,
    swaps: false,
  },
  networks: [nearMainnet],
  projectId: projectId,
});
