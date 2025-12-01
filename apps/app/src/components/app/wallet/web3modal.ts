import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import {
  defineChain,
  solana,
  solanaTestnet,
  solanaDevnet,
} from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { walletConnect } from '@wagmi/connectors';
import type { CreateConnectorFn } from '@wagmi/core';
import Cookies from 'js-cookie';

import { projectId } from '@/utils/app/config';
import { NetworkId } from '@/utils/types';

const createNearChain = (
  id: number,
  name: string,
  rpcUrl: string,
  explorerUrl: string,
  isTestnet: boolean,
) =>
  defineChain({
    blockExplorers: {
      default: {
        name: 'NEAR Explorer',
        url: explorerUrl,
      },
    },
    caipNetworkId: `eip155:${id}`,
    chainNamespace: 'eip155',
    id,
    name,
    nativeCurrency: {
      decimals: 18,
      name: 'NEAR',
      symbol: 'NEAR',
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
    testnet: isTestnet,
  });

export const nearMainnet = createNearChain(
  397,
  'Near Mainnet',
  'https://eth-rpc.mainnet.near.org',
  'https://nearblocks.io',
  false,
);

export const nearTestnet = createNearChain(
  398,
  'Near Testnet',
  'https://eth-rpc.testnet.near.org',
  'https://testnet.nearblocks.io',
  true,
);

const connectors: Array<CreateConnectorFn> = [
  walletConnect({
    metadata: {
      description: '',
      icons: [],
      name: '',
      url: '',
    },
    projectId,
    showQrModal: false,
  }),
];

export const wagmiAdapter = new WagmiAdapter({
  connectors,
  networks: [nearMainnet, nearTestnet],
  projectId,
});

export const solanaAdapter = new SolanaAdapter();

// Check if there's an active session before enabling reconnect
const hasActiveSession = () => {
  if (typeof window === 'undefined') return false;
  return Cookies.get('walletSessionActive') === 'true';
};

export const web3Modal = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  allWallets: 'SHOW',
  coinbasePreference: 'eoaOnly',
  defaultNetwork: nearTestnet,
  enableWalletConnect: true,
  enableReconnect: hasActiveSession(),
  allowUnsupportedChain: true,
  features: {
    analytics: false,
    email: false,
    onramp: false,
    socials: false,
    swaps: false,
  },
  networks: [nearMainnet, nearTestnet, solana, solanaTestnet, solanaDevnet],
  projectId,
});

// Helper function to switch network based on networkId
export const setWeb3ModalNetwork = (networkId: NetworkId) => {
  const targetNetwork = networkId === 'testnet' ? nearTestnet : nearMainnet;
  try {
    web3Modal.switchNetwork(targetNetwork);
  } catch (error) {
    // Ignore errors if network is already set or switch fails
  }
};
