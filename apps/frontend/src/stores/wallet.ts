'use client';

import { NearConnector } from '@hot-labs/near-connect';
import SignClient from '@walletconnect/sign-client';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type { Network } from '@/types/enums';

type Wallet = Awaited<ReturnType<NearConnector['wallet']>>;

type WalletStoreState = {
  account: null | string;
  connect: () => Promise<void>;
  connector: NearConnector | null;
  disconnect: () => Promise<void>;
  isInitialized: boolean;
  setAccount: (account: null | string) => void;
  setConnector: (connector: NearConnector | null) => void;
  setInitialized: (value: boolean) => void;
  setWallet: (wallet: null | Wallet) => void;
  wallet: null | Wallet;
};

export const walletStore = createStore<WalletStoreState>((set, get) => ({
  account: null,
  connect: async () => {
    const { connector } = get();
    if (!connector) return;
    await connector.connect();
  },
  connector: null,
  disconnect: async () => {
    const { connector } = get();
    if (!connector) return;
    await connector.disconnect();
  },
  isInitialized: false,
  setAccount: (account) => set({ account }),
  setConnector: (connector) => set({ connector }),
  setInitialized: (value) => set({ isInitialized: value }),
  setWallet: (wallet) => set({ wallet }),
  wallet: null,
}));

export const useWalletStore = <T>(selector: (state: WalletStoreState) => T) =>
  useStore(walletStore, selector);

export const getAccount = () => walletStore.getState().account;
export const getConnector = () => walletStore.getState().connector;
export const getWallet = () => walletStore.getState().wallet;

type InitWalletParams = {
  mainnetUrl: string;
  network: Network;
  projectId: string;
  providers: { url: string }[];
  testnetUrl: string;
};

let cleanup: (() => void) | undefined;

export const initWalletStore = async ({
  mainnetUrl,
  network,
  projectId,
  providers,
  testnetUrl,
}: InitWalletParams) => {
  cleanup?.();

  try {
    const url = network === 'mainnet' ? mainnetUrl : testnetUrl;
    const rpcs = providers.map((rpc) => rpc.url);

    const walletConnect = SignClient.init({
      metadata: {
        description:
          'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
        icons: ['/favicon.ico'],
        name: 'NearBlocks',
        url,
      },
      projectId,
    });

    const connector = new NearConnector({
      logger: {
        log: (args: unknown) => console.log(args),
      },
      network,
      providers: { [network]: rpcs },
      walletConnect,
    });

    const { setAccount, setConnector, setInitialized, setWallet } =
      walletStore.getState();

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

    cleanup = () => {
      connector.off('wallet:signIn', onSignIn);
      connector.off('wallet:signOut', onSignOut);
    };

    const wallet = await connector.wallet().catch(() => undefined);
    const accounts = await wallet?.getAccounts().catch(() => []);

    if (accounts && accounts.length > 0) {
      setAccount(accounts[0].accountId);
      setWallet(wallet ?? null);
    }

    setInitialized(true);
  } catch (err) {
    console.error('Failed to initialize wallet store:', err);
    walletStore.getState().setInitialized(true);
  }
};
