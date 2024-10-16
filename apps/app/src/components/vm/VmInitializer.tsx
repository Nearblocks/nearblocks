import { setupWalletSelector } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupBitgetWallet } from '@near-wallet-selector/bitget-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupNarwallets } from '@near-wallet-selector/narwallets';
import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupNearFi } from '@near-wallet-selector/nearfi';
import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet';
import { setupNeth } from '@near-wallet-selector/neth';
import { setupXDEFI } from '@near-wallet-selector/xdefi';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';
import {
  CommitButton,
  EthersProviderContext,
  useAccount,
  useCache,
  useInitNear,
  useNear,
  utils,
  Widget,
} from 'near-social-vm';
import React, { useCallback, useEffect, useState } from 'react';
import Big from 'big.js';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { useEthersProviderContext } from '@/data/web3';
import { useAuthStore } from '@/stores/auth';
import { useVmStore } from '@/stores/vm';
import { networkId } from '@/utils/config';
import '@near-wallet-selector/modal-ui/styles.css';
import Link from 'next/link';
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { setupEthereumWallets } from '@near-wallet-selector/ethereum-wallets';
import { createWeb3Modal } from '@web3modal/wagmi';
import { reconnect, http, createConfig, type Config } from '@wagmi/core';
import { walletConnect, injected } from '@wagmi/connectors';
import { type Chain } from '@wagmi/core/chains';
import { env } from 'next-runtime-env';

const projectId = env('NEXT_PUBLIC_REOWN_PROJECT_ID') || '';

const nears: Chain = {
  id: networkId === 'mainnet' ? 397 : 398,
  name: `NEAR Protocol ${networkId === 'mainnet' ? 'Mainnet' : 'Testnet'}`,
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: {
      http: [
        `${
          networkId === 'mainnet'
            ? ' https://eth-rpc.mainnet.near.org'
            : 'https://eth-rpc.testnet.near.org'
        }`,
      ],
    },
    public: {
      http: [
        `${
          networkId === 'mainnet'
            ? 'https://eth-rpc.mainnet.near.org'
            : 'https://eth-rpc.testnet.near.org'
        }`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: `${
        networkId === 'mainnet'
          ? 'https://nearblocks.io/'
          : 'https://testnet.nearblocks.io/'
      }`,
    },
  },
  testnet: networkId !== 'mainnet',
};

// @ts-ignore
const wagmiConfig: Config = createConfig({
  chains: [nears],
  transports: {
    [nears.id]: http(),
  },
  connectors: [
    // @ts-ignore
    walletConnect({
      projectId,
      showQrModal: false,
    }),
    // @ts-ignore
    injected({ shimDisconnect: true }),
  ],
});

reconnect(wagmiConfig);

// @ts-ignore
const web3Modal = createWeb3Modal({
  // @ts-ignore
  wagmiConfig: wagmiConfig,
  projectId,
  enableOnramp: false,
  allWallets: 'SHOW',
});

export default function VmInitializer() {
  const [signedIn, setSignedIn] = useState(false);
  const [signedAccountId, setSignedAccountId] = useState(null);
  const [availableStorage, setAvailableStorage] = useState<Big | null>(null);
  const [walletModal, setWalletModal] = useState<WalletSelectorModal | null>(
    null,
  );
  const ethersProviderContext = useEthersProviderContext();
  const { initNear } = useInitNear();
  const near = useNear();
  const account = useAccount();
  const cache = useCache();
  const accountId = account.accountId;
  const setAuthStore = useAuthStore((state) => state.set);
  const setVmStore = useVmStore((store) => store.set);
  // const { requestAuthentication, saveCurrentUrl } = useSignInRedirect();

  useEffect(() => {
    initNear &&
      initNear({
        networkId: networkId,
        walletConnectCallback: () => {},
        selector: setupWalletSelector({
          network: networkId,
          modules: [
            setupBitgetWallet(),
            setupMyNearWallet(),
            setupSender(),
            setupHereWallet(),
            setupMathWallet(),
            setupNightly(),
            setupMeteorWallet(),
            setupNarwallets(),
            setupWelldoneWallet(),
            setupLedger(),
            setupNearFi(),
            setupCoin98Wallet(),
            setupNeth(),
            setupXDEFI(),
            setupNearMobileWallet(),
            setupMintbaseWallet(),
            setupBitteWallet(),
            // @ts-ignore
            setupEthereumWallets({
              wagmiConfig,
              // @ts-ignore
              web3Modal,
              alwaysOnboardDuringSignIn: true,
            }),
          ],
        }),
        customElements: {
          Link: ({ href, to, ...rest }: any) => (
            <Link href={sanitizeUrl(href ?? to)} {...rest} />
          ),
        },
      });
  }, [initNear]);

  useEffect(() => {
    if (!near) {
      return;
    }
    near.selector.then((selector: any) => {
      setWalletModal(setupModal(selector, { contractId: '' }));
    });
  }, [near]);

  const requestSignInWithWallet = useCallback(() => {
    walletModal?.show();
    return false;
  }, [walletModal]);

  const logOut = useCallback(async () => {
    if (!near) {
      return;
    }
    const wallet = await (await near.selector).wallet();
    wallet.signOut();
    near.accountId = null;
    setSignedIn(false);
    setSignedAccountId(null);
    localStorage.removeItem('accountId');
  }, [near]);

  const refreshAllowance = useCallback(async () => {
    alert(
      "You're out of access key allowance. Need sign in again to refresh it",
    );
    await logOut();
  }, [logOut]);

  useEffect(() => {
    if (!near) {
      return;
    }
    setSignedIn(!!accountId);
    setSignedAccountId(accountId);
  }, [near, accountId]);

  useEffect(() => {
    setAvailableStorage(
      account.storageBalance
        ? Big(account.storageBalance.available).div(utils.StorageCostPerByte)
        : Big(0),
    );
  }, [account]);

  useEffect(() => {
    if (navigator.userAgent !== 'ReactSnap') {
      const pageFlashPrevent = document.getElementById('page-flash-prevent');
      if (pageFlashPrevent) {
        pageFlashPrevent.remove();
      }
    }
  }, []);

  useEffect(() => {
    setAuthStore({
      account,
      accountId: signedAccountId || '',
      availableStorage,
      logOut,
      refreshAllowance,
      requestSignInWithWallet,
      signedIn,
    });
  }, [
    account,
    availableStorage,
    logOut,
    refreshAllowance,
    requestSignInWithWallet,
    signedIn,
    signedAccountId,
    setAuthStore,
  ]);
  useEffect(() => {
    setVmStore({
      cache,
      CommitButton,
      ethersContext: ethersProviderContext,
      EthersProvider: EthersProviderContext.Provider,
      Widget,
      near,
    });
  }, [cache, ethersProviderContext, setVmStore, near]);
  return <></>;
}
