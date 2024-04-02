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
import { networkId, bosNetworkId } from '@/utils/config';
import '@near-wallet-selector/modal-ui/styles.css';
import Link from 'next/link';

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
    const testNearConfig = {
      nodeUrl: 'https://rpc.testnet.near.org',
      archivalNodeUrl: 'https://rpc.testnet.internal.near.org',
      contractName: 'v1.social08.testnet',
      walletUrl: 'https://wallet.testnet.near.org',
      wrapNearAccountId: 'wrap.testnet',
      apiUrl: 'https://discovery-api.stage.testnet.near.org',
      enableWeb4FastRpc: false,
    };

    const mainNearConfig = {
      nodeUrl: 'https://rpc.mainnet.near.org',
      archivalNodeUrl: 'https://rpc.mainnet.internal.near.org',
      contractName: 'social.near',
      walletUrl: 'https://wallet.near.org',
      wrapNearAccountId: 'wrap.near',
      apiUrl: 'https://api.near.social',
      enableWeb4FastRpc: false,
    };
    initNear &&
      initNear({
        networkId: bosNetworkId,
        config: networkId === 'mainnet' ? mainNearConfig : testNearConfig,
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
