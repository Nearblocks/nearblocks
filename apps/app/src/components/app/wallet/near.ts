// wallet selector
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet';
import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core';
import { setupEthereumWallets } from '@near-wallet-selector/ethereum-wallets';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';
import { setupModal } from '@near-wallet-selector/modal-ui';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { setupNearFi } from '@near-wallet-selector/nearfi';
import { providers } from 'near-api-js';

import { wagmiAdapter, web3Modal } from '@/components/app/wallet/web3modal';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

export class Wallet {
  /**
   * Makes a call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @param {string} options.gas - the amount of gas to use
   * @param {string} options.deposit - the amount of yoctoNEAR to deposit
   * @returns {Promise<Transaction>} - the resulting transaction
   */
  callMethod = async ({
    args = {},
    contractId,
    deposit = NO_DEPOSIT,
    gas = THIRTY_TGAS,
    method,
  }: {
    args: object;
    contractId: string;
    deposit: string;
    gas: string;
    method: string;
  }) => {
    const selectedWallet = await (await this.selector).wallet();
    const outcome = await selectedWallet.signAndSendTransaction({
      actions: [
        {
          params: {
            args,
            deposit,
            gas,
            methodName: method,
          },
          type: 'FunctionCall',
        },
      ],
      receiverId: contractId,
    });

    return providers.getTransactionLastResult(outcome);
  };

  createAccessKeyFor: string;

  /**
   * Gets the access keys for a given account
   * @param {string} accountId
   * @returns {Promise<Object[]>} - the access keys for the account
   */
  getAccessKeys = async (accountId: string) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve account state from the network
    // eslint-disable-next-line
    const keys: any = await provider.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_access_key_list',
    });
    return keys?.keys;
  };

  /**
   * Gets the result of a transaction
   * @param {string} txhash - the transaction hash
   * @returns {Promise<JSON.value>} - the result of the transaction
   */
  getTransactionResult = async (txhash: string | Uint8Array) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  };

  networkId: string;
  // eslint-disable-next-line
  selector: any; // Make sure this is initialized later

  /**
   * Signs and sends transactions
   * @param {Object[]} transactions - the transactions to sign and send
   * @returns {Promise<Transaction[]>} - the resulting transactions
   */
  // eslint-disable-next-line
  signAndSendTransactions = async ({ transactions }: any) => {
    const selectedWallet = await (await this.selector).wallet();
    return selectedWallet.signAndSendTransactions({ transactions });
  };

  /**
   * Displays a modal to login the user
   */
  signIn = async () => {
    // Ensure the selector is initialized
    if (!this.selector) {
      console.error('Wallet selector is not initialized');
      return;
    }

    // Create modal and show it
    const modal = setupModal(await this.selector, {
      contractId: this.createAccessKeyFor,
    });

    if (!modal) {
      console.error('Failed to create modal');
      return;
    }

    modal.show();
  };

  /**
   * Logout the user
   */
  signOut = async () => {
    const selectedWallet = await (await this.selector).wallet();
    selectedWallet.signOut();
  };

  /**
   * To be called when the website loads
   * @param {Function} accountChangeHook - a function that is called when the user signs in or out
   * @returns {Promise<string>} - the accountId of the signed-in user
   */
  // eslint-disable-next-line
  startUp = async (accountChangeHook: (arg0: any) => void) => {
    // Initialize the wallet selector
    this.selector = setupWalletSelector({
      modules: [
        setupBitteWallet(),
        setupCoin98Wallet(),
        setupEthereumWallets({
          wagmiConfig: wagmiAdapter.wagmiConfig as any,
          web3Modal: web3Modal as any,
        }),
        setupLedger(),
        setupMintbaseWallet(),
        setupMeteorWallet(),
        setupNearFi(),
        setupNearMobileWallet(),
        setupMyNearWallet(),
      ],
      network: this.networkId as NetworkId,
    });

    // Ensure selector is initialized
    const walletSelector = await this.selector;
    if (!walletSelector) {
      console.error('Failed to initialize wallet selector');
      return '';
    }

    const isSignedIn = walletSelector.isSignedIn();
    const accountId = isSignedIn
      ? walletSelector.store.getState().accounts[0].accountId
      : '';

    walletSelector.store.observable.subscribe(
      // eslint-disable-next-line
      async (state: { accounts: any[] }) => {
        const signedAccount = state?.accounts.find((account) => account.active)
          ?.accountId;
        accountChangeHook(signedAccount || '');
      },
    );

    return accountId;
  };

  /**
   * @constructor
   * @param {Object} options - the options for the wallet
   * @param {string} options.networkId - the network id to connect to
   * @param {string} options.createAccessKeyFor - the contract to create an access key for
   * @example
   * const wallet = new Wallet({ networkId: 'testnet', createAccessKeyFor: 'contractId' });
   * wallet.startUp((signedAccountId) => console.log(signedAccountId));
   */
  constructor({ createAccessKeyFor = '', networkId = 'testnet' }) {
    this.createAccessKeyFor = createAccessKeyFor;
    this.networkId = networkId;
  }
}
