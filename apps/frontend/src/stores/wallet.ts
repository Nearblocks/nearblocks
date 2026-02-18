'use client';

import { NearConnector } from '@hot-labs/near-connect';
import SignClient from '@walletconnect/sign-client';
import { createStore } from 'zustand/vanilla';

import type { Network } from '@/types/enums';

type Wallet = Awaited<ReturnType<NearConnector['wallet']>>;

interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setAccount: (account: null | string) => void;
  setConnector: (connector: NearConnector | null) => void;
  setInitialized: (value: boolean) => void;
  setWallet: (wallet: null | Wallet) => void;
}

export interface WalletState extends WalletActions {
  account: null | string;
  connector: NearConnector | null;
  isInitialized: boolean;
  wallet: null | Wallet;
}

export type WalletStore = ReturnType<typeof createWalletStore>;

type CreateWalletStoreParams = {
  mainnetUrl: string;
  network: Network;
  projectId: string;
  providers: { url: string }[];
  testnetUrl: string;
};

let signClientPromise: null | ReturnType<typeof SignClient.init> = null;

export const createWalletStore = ({
  mainnetUrl,
  network,
  projectId,
  providers,
  testnetUrl,
}: CreateWalletStoreParams) => {
  const store = createStore<WalletState>()((set, get) => ({
    /* eslint-disable perfectionist/sort-objects */
    account: null,
    connector: null,
    isInitialized: false,
    wallet: null,
    connect: async () => {
      const { connector } = get();
      if (!connector) return;
      await connector.connect();
    },
    disconnect: async () => {
      const { connector } = get();
      if (!connector) return;
      await connector.disconnect();
    },
    setAccount: (account) => set({ account }),
    setConnector: (connector) => set({ connector }),
    setInitialized: (value) => set({ isInitialized: value }),
    setWallet: (wallet) => set({ wallet }),
    /* eslint-enable perfectionist/sort-objects */
  }));

  // Initialize wallet asynchronously
  (async () => {
    try {
      const url = network === 'mainnet' ? mainnetUrl : testnetUrl;
      const rpcs = providers.map((rpc) => rpc.url);

      if (!signClientPromise) {
        signClientPromise = SignClient.init({
          metadata: {
            description:
              'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
            icons: ['/icon.svg'],
            name: 'NearBlocks',
            url,
          },
          projectId,
        });
      }

      const connector = new NearConnector({
        logger: {
          log: (args: unknown) => console.error(args),
        },
        network,
        providers: { [network]: rpcs },
        walletConnect: signClientPromise,
      });

      const { setAccount, setConnector, setInitialized, setWallet } =
        store.getState();

      setConnector(connector);

      const onSignIn = async (t: { accounts: { accountId: string }[] }) => {
        setAccount(t.accounts[0].accountId);
        const wallet = await connector.wallet().catch(() => undefined);
        setWallet(wallet ?? null);
      };

      const onSignOut = () => {
        setAccount(null);
        setWallet(null);
      };

      connector.on('wallet:signIn', onSignIn);
      connector.on('wallet:signOut', onSignOut);

      const wallet = await connector.wallet().catch(() => undefined);
      const accounts = await wallet?.getAccounts().catch(() => []);

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0].accountId);
        setWallet(wallet ?? null);
      }

      setInitialized(true);
    } catch (err) {
      console.error('Failed to initialize wallet store:', err);
      store.getState().setInitialized(true);
    }
  })();

  return store;
};
