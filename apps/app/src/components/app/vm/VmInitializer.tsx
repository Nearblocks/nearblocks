'use client';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { setupBitgetWallet } from '@near-wallet-selector/bitget-wallet';
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupEthereumWallets } from '@near-wallet-selector/ethereum-wallets';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupModal } from '@near-wallet-selector/modal-ui';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNarwallets } from '@near-wallet-selector/narwallets';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { setupNearFi } from '@near-wallet-selector/nearfi';
import { setupNeth } from '@near-wallet-selector/neth';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupSender } from '@near-wallet-selector/sender';
import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet';
import { setupXDEFI } from '@near-wallet-selector/xdefi';
import Big from 'big.js';
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
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import { useEthersProviderContext } from '@/data/web3';
import { useAuthStore } from '@/stores/app/auth';
import { useVmStore } from '@/stores/app/vm';
import { networkId } from '@/utils/app/config';
import { wagmiConfig, web3Modal } from '@/utils/app/web3modal';

export default function VmInitializer() {
  const [signedIn, setSignedIn] = useState(false);
  const [signedAccountId, setSignedAccountId] = useState(null);
  const [availableStorage, setAvailableStorage] = useState<Big | null>(null);
  const [_walletModal, setWalletModal] = useState<null | WalletSelectorModal>(
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
        customElements: {
          Link: ({ href, to, ...rest }: any) => (
            <Link href={sanitizeUrl(href ?? to)} {...rest} legacyBehavior />
          ),
        },
        networkId: networkId,
        selector: setupWalletSelector({
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
            setupEthereumWallets({
              alwaysOnboardDuringSignIn: true,
              wagmiConfig: wagmiConfig as any,
              web3Modal: web3Modal as any,
            }),
          ],
          network: networkId,
        }),
        walletConnectCallback: () => {},
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

  const requestSignInWithWallet = useCallback(async () => {
    try {
      if (!near) {
        return;
      }

      const selector = await near.selector;
      const modal = setupModal(selector, { contractId: '' });
      modal.show();
    } catch (error) {
      console.error('Failed to set up or show the modal:', error);
    }
  }, [near]);

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
      near,
      Widget,
    });
  }, [cache, ethersProviderContext, setVmStore, near]);
  return <></>;
}
