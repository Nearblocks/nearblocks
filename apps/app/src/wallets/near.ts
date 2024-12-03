// wallet selector
// import { setupBitgetWallet } from '@near-wallet-selector/bitget-wallet';
// import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';
//import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet';
import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core';
// import { setupEthereumWallets } from '@near-wallet-selector/ethereum-wallets';
// import { setupHereWallet } from '@near-wallet-selector/here-wallet';
//import { setupLedger } from '@near-wallet-selector/ledger';
//import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
//import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';
import { setupModal } from '@near-wallet-selector/modal-ui';
import '@near-wallet-selector/modal-ui/styles.css';
//import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
//import { setupNarwallets } from '@near-wallet-selector/narwallets';
//import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
//import { setupNearFi } from '@near-wallet-selector/nearfi';
//import { setupNightly } from '@near-wallet-selector/nightly';
//import { setupSender } from '@near-wallet-selector/sender';
//import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet';
//import { setupXDEFI } from '@near-wallet-selector/xdefi';
// near api js
import { providers, utils } from 'near-api-js';
import { createContext } from 'react';

// ethereum wallets
// import { wagmiConfig, web3Modal } from './web3modal';

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
  }): Promise<any> => {
    // Sign a transaction with the "FunctionCall" action
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
   *
   * @param {string} accountId
   * @returns {Promise<Object[]>} - the access keys for the
   */
  getAccessKeys = async (accountId: any) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve account state from the network
    const keys: any = await provider.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_access_key_list',
    });
    return keys?.keys;
  };
  /**
   * Gets the balance of an account
   * @param {string} accountId - the account id to get the balance of
   * @returns {Promise<number>} - the balance of the account
   *
   */
  getBalance = async (accountId: any) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve account state from the network
    const account: any = await provider.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_account',
    });

    // Format the amout and remove commas
    const amountString = utils.format.formatNearAmount(account?.amount);
    const amount = Number(amountString.replace(/,/g, '').trim());

    // Return amount in NEAR
    return account.amount ? amount : 0;
  };

  /**
   * Makes a call to a contract
   * @param {string} txhash - the transaction hash
   * @returns {Promise<JSON.value>} - the result of the transaction
   */
  getTransactionResult = async (txhash: string | Uint8Array) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  };

  networkId: string;

  selector: any;

  /**
   * Signs and sends transactions
   * @param {Object[]} transactions - the transactions to sign and send
   * @returns {Promise<Transaction[]>} - the resulting transactions
   *
   */
  signAndSendTransactions = async ({ transactions }: any) => {
    const selectedWallet = await (await this.selector).wallet();
    return selectedWallet.signAndSendTransactions({ transactions });
  };

  /**
   * Displays a modal to login the user
   */
  signIn = async () => {
    const modal = setupModal(await this.selector, {
      contractId: this.createAccessKeyFor,
    });
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
   * @param {Function} accountChangeHook - a function that is called when the user signs in or out#
   * @returns {Promise<string>} - the accountId of the signed-in user
   */
  startUp = async (accountChangeHook: (arg0: any) => void) => {
    this.selector = setupWalletSelector({
      modules: [
        //setupBitgetWallet(),
        //setupMyNearWallet(),
        //setupSender(),
        //// setupHereWallet(),
        //setupMathWallet(),
        //setupNightly(),
        setupMeteorWallet(),
        //setupNarwallets(),
        //setupWelldoneWallet(),
        //setupLedger(),
        //setupNearFi(),
        //setupCoin98Wallet(),
        //setupXDEFI(),
        //setupNearMobileWallet(),
        //setupMintbaseWallet(),
        //setupBitteWallet(),
//        setupEthereumWallets({
//          alwaysOnboardDuringSignIn: true,
//          wagmiConfig: wagmiConfig as any,
//          web3Modal: web3Modal as any,
//        }),
      ],
      network: this.networkId as NetworkId,
    });

    const walletSelector = await this.selector;
    const isSignedIn = walletSelector.isSignedIn();
    const accountId = isSignedIn
      ? walletSelector.store.getState().accounts[0].accountId
      : '';

    walletSelector.store.observable.subscribe(
      async (state: { accounts: any[] }) => {
        const signedAccount = state?.accounts.find((account) => account.active)
          ?.accountId;
        accountChangeHook(signedAccount || '');
      },
    );

    return accountId;
  };

  /**
   * Makes a read-only call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @returns {Promise<JSON.value>} - the result of the method call
   */
  viewMethod = async ({
    args = {},
    contractId,
    method,
  }: {
    args: object;
    contractId: string;
    method: string;
  }): Promise<any> => {
    const url = `https://rpc.${this.networkId}.near.org`;
    const provider = new providers.JsonRpcProvider({ url });

    const res: any = await provider.query({
      account_id: contractId,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
      method_name: method,
      request_type: 'call_function',
    });
    return JSON.parse(Buffer.from(res.result).toString());
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

interface NearContextType {
  signedAccountId: string;
  wallet: undefined | Wallet; // Allow `undefined` initially
}

/**
 * @typedef NearContext
 * @property {import('./wallets/near').Wallet} wallet Current wallet
 * @property {string} signedAccountId The AccountId of the signed user
 */

/** @type {import ('react').Context<NearContext>} */
export const NearContext = createContext<NearContextType>({
  signedAccountId: '',
  wallet: undefined,
});
