import {
  HotConnector,
  evm,
  solana,
  ton,
  stellar,
  NearConnector,
} from '@hot-labs/wibe3';
import { NearConnector as InnerNearConnector } from '@hot-labs/near-connect';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { web3Modal, wagmiAdapter, setWeb3ModalNetwork } from './web3modal';
import {
  getAccount,
  disconnect,
  sendTransaction,
  waitForTransactionReceipt,
} from '@wagmi/core';
import { isAddress } from 'viem';

const COOKIE_WALLET_TYPE = 'connectedWalletType';

type Network = 'mainnet' | 'testnet';

let hotConnectorInstance: HotConnector | null = null;

export class Wallet {
  networkId: Network;
  walletInstance: any | null = null;
  private selectorPromise: Promise<void> | null = null;
  private isInitialized = false;
  private _accountId: string = '';
  private _walletType: string = '';
  private unsubscribe: (() => void) | null = null;
  private disconnectUnsubscribe: (() => void) | null = null;
  private wagmiUnsubscribe: (() => void) | null = null;
  private web3ModalUnsubscribe: (() => void) | null = null;
  private isInitializing = false;
  private hasVerifiedConnection = false;
  private isSigningOut = false;
  private startupPromise: Promise<void> | null = null;
  private onVerificationNeeded?: () => void;
  private _isVerified: boolean = false;

  constructor({
    networkId = 'testnet',
  }: {
    createAccessKeyFor?: string;
    networkId?: Network;
  }) {
    this.networkId = networkId;
    setWeb3ModalNetwork(networkId);
  }

  private isCancellationError = (error: any) =>
    /user closed|rejected|reject|cancel|cancelled|canceled|abort|aborted/i.test(
      error?.message || String(error) || '',
    );

  private extractAccountId(account: any): string {
    if (!account) return '';
    if (typeof account === 'string') return account;
    return (
      account.accountId ||
      account.address ||
      account.publicKey?.toString() ||
      ''
    );
  }

  private inferWalletType(accountId: string): string {
    if (!accountId) return 'near';
    if (isAddress(accountId)) return 'evm';
    if (/^[GM][A-Z2-7]{55}$/.test(accountId)) return 'stellar';
    if (/^(EQ|UQ|kQ|0Q)[A-Za-z0-9+/_-]{46}$/.test(accountId)) return 'ton';
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(accountId)) return 'solana';
    return 'near';
  }

  private wrapWallet(wallet: any) {
    if (!wallet || wallet.signAndSendTransaction) return wallet;
    wallet.signAndSendTransaction = async ({ receiverId, actions }: any) => {
      if (!wallet.signIntents)
        throw new Error('Wallet does not support signAndSendTransaction');
      const result = await wallet.signIntents([{ receiverId, actions }]);
      return {
        ...result,
        transaction_outcome: {
          id: result.signature || '',
          outcome: {
            status: { SuccessValue: '' },
            logs: [],
            receipt_ids: [],
            gas_burnt: 0,
          },
        },
      };
    };
    return wallet;
  }

  private setConnectedAccount(
    accountId: string,
    walletInstance?: any,
    walletType?: string,
  ) {
    this._accountId = accountId;
    this._walletType = walletType || this.inferWalletType(accountId);
    Cookies.set('signedAccountId', accountId);
    Cookies.set(COOKIE_WALLET_TYPE, this._walletType);
    this.hasVerifiedConnection = true;
    if (walletInstance) this.walletInstance = this.wrapWallet(walletInstance);
  }

  private clearConnectedAccount() {
    this._accountId = '';
    this._walletType = '';
    Cookies.remove('signedAccountId');
    Cookies.remove(COOKIE_WALLET_TYPE);
    this.walletInstance = null;
    this.hasVerifiedConnection = false;
  }

  private async syncConnectorState(): Promise<void> {
    if (!hotConnectorInstance) return;

    const config = wagmiAdapter.wagmiConfig;
    const account = getAccount(config);
    const evmAddress =
      account.address || (isAddress(this._accountId) ? this._accountId : '');
    const [nearConn, evmConn, solConn, tonConn, stellarConn] =
      hotConnectorInstance.connectors;

    // Only set EVM wallet if we're not actively using another non-EVM wallet
    const isUsingNonEvmWallet =
      this._walletType &&
      this._walletType !== 'evm' &&
      this._walletType !== 'near';
    if (evmConn && !isUsingNonEvmWallet) {
      if (
        evmAddress &&
        !['connecting', 'reconnecting'].includes(account.status)
      ) {
        (evmConn as any).setWallet(
          this.createEvmMockWallet(evmConn, evmAddress),
        );
      } else if (!evmAddress) {
        (evmConn as any).removeWallet?.();
      }
    } else if (evmConn && isUsingNonEvmWallet) {
      // Remove EVM wallet from Hot Connector when using Solana/TON/Stellar
      (evmConn as any).removeWallet?.();
    }

    if (solConn) {
      try {
        const walletInfo = (web3Modal as any).getState?.();
        const isUsingAppkit =
          walletInfo?.selectedNetworkId?.includes?.('solana');
        const solanaAddress = isUsingAppkit
          ? (web3Modal as any).getAddress?.()
          : null;

        // Also check if we have a Solana wallet type set
        const hasSolanaWallet =
          this._walletType === 'solana' &&
          this._accountId &&
          !isAddress(this._accountId);

        if ((solanaAddress && !isAddress(solanaAddress)) || hasSolanaWallet) {
          const address = solanaAddress || this._accountId;
          (solConn as any).setWallet(
            this.createSolanaMockWallet(solConn, address),
          );
        } else {
          (solConn as any).removeWallet?.();
        }
      } catch (e) {
        (solConn as any).removeWallet?.();
      }
    }

    const walletMap: Record<string, any> = {
      near: nearConn,
      solana: solConn,
      ton: tonConn,
      stellar: stellarConn,
    };
    Object.entries(walletMap).forEach(([type, c]) => {
      if (c && type !== this._walletType) (c as any).removeWallet?.();
    });

    const activeConn = walletMap[this._walletType];
    if (this._accountId && activeConn) {
      const wallet = this.wrapWallet(
        activeConn.wallet || {
          type: activeConn.type,
          getAccounts: async () => [{ accountId: this._accountId }],
          getAddress: async () => this._accountId,
          disconnect: async () => {},
          connector: activeConn,
        },
      );
      (activeConn as any).setWallet(wallet);
    }
  }

  private createEvmMockWallet(evmConnector: any, evmAddress: string) {
    const config = wagmiAdapter.wagmiConfig;
    return {
      type: 1,
      getAddress: async () => getAccount(config).address || evmAddress,
      getPublicKey: async () => '',
      disconnect: async () => {},
      signAndSendTransaction: async ({ receiverId, actions }: any) => {
        const to = isAddress(receiverId)
          ? receiverId
          : getAccount(config).address;
        if (!to) throw new Error(`Invalid receiver: ${receiverId}`);

        const value = BigInt(actions?.[0]?.params?.deposit || 0);
        const hash = await sendTransaction(config, {
          to: to as `0x${string}`,
          value,
        });
        const receipt = await waitForTransactionReceipt(config, { hash });

        return {
          transaction_outcome: {
            id: hash,
            block_hash: receipt.blockHash,
            outcome: {
              status: { SuccessValue: '' },
              logs: [],
              receipt_ids: [],
              gas_burnt: 0,
            },
          },
        };
      },
      connector: evmConnector,
    };
  }

  private createSolanaMockWallet(solanaConnector: any, solanaAddress: string) {
    return {
      type: 2,
      getAddress: async () => solanaAddress,
      getPublicKey: async () => solanaAddress,
      disconnect: async () => {},
      signAndSendTransaction: async ({ receiverId, actions }: any) => {
        // If it looks like an intent (e.g. receiverId is 'intents.near' or actions have 'intents'), sign message
        if (
          receiverId === 'intents.near' ||
          actions?.[0]?.type === 'FunctionCall'
        ) {
          const message = JSON.stringify({
            deadline: actions?.[0]?.params?.args?.deadline,
            nonce: actions?.[0]?.params?.args?.nonce,
            verifying_contract: receiverId,
            signer_id: solanaAddress,
            intents: actions?.[0]?.params?.args?.intents || [],
          });

          // Get the Solana provider from web3Modal
          const provider = (web3Modal as any).getWalletProvider?.();
          if (provider && provider.signMessage) {
            const { signature } = await provider.signMessage(
              new TextEncoder().encode(message),
            );

            const signatureBase64 =
              signature instanceof Uint8Array
                ? btoa(String.fromCharCode(...Array.from(signature)))
                : typeof signature === 'string'
                ? signature
                : signature?.toString?.('base64') || '';

            const action = actions?.[0]?.params;
            return {
              transaction_outcome: {
                id: signatureBase64 || '',
                ...(signatureBase64 && {
                  block_hash: `${Date.now()}_${signatureBase64.substring(
                    0,
                    10,
                  )}`,
                }),
                outcome: {
                  status: {
                    SuccessValue: signatureBase64
                      ? btoa(JSON.stringify({ success: true }))
                      : '',
                  },
                  ...(receiverId && {
                    logs: [
                      `Contract: ${receiverId}`,
                      `Signer: ${solanaAddress}`,
                    ],
                  }),
                  ...(signatureBase64 && { receipt_ids: [signatureBase64] }),
                  ...(action?.gas && {
                    gas_burnt:
                      typeof action.gas === 'string'
                        ? parseInt(action.gas, 10)
                        : action.gas,
                  }),
                  ...(solanaAddress && { executor_id: solanaAddress }),
                  ...((receiverId || action?.methodName || action?.args) && {
                    metadata: {
                      ...(receiverId && { receiver_id: receiverId }),
                      ...(action?.methodName && {
                        method_name: action.methodName,
                      }),
                      ...(action?.args && {
                        args_base64: btoa(JSON.stringify(action.args)),
                      }),
                      ...(action?.deposit && { deposit: action.deposit }),
                    },
                  }),
                },
              },
            };
          }
        }

        throw new Error('Solana transaction signing not fully implemented yet');
      },
      signMessage: async (message: string | Uint8Array) => {
        const provider = (web3Modal as any).getWalletProvider?.();
        if (provider && provider.signMessage) {
          const msgEncoded =
            typeof message === 'string'
              ? new TextEncoder().encode(message)
              : message;
          return await provider.signMessage(msgEncoded);
        }
        throw new Error('Solana provider not found');
      },
      connector: solanaConnector,
    };
  }

  private setupWagmiListener(): void {
    this.wagmiUnsubscribe?.();
    this.web3ModalUnsubscribe?.();
    const config = wagmiAdapter.wagmiConfig;

    this.wagmiUnsubscribe = config.subscribe(
      (state) => state,
      async () => {
        const account = getAccount(config);
        if (['connecting', 'reconnecting'].includes(account.status)) return;

        // Don't sync state during initialization to prevent unwanted connection prompts
        if (!this.isInitializing) {
          await this.syncConnectorState();
        }

        // Only set EVM account if we don't have a non-EVM wallet connected or if current wallet is EVM
        const isNonEvmWallet =
          this._walletType &&
          this._walletType !== 'evm' &&
          this._walletType !== 'near';
        if (account.isConnected && account.address && !isNonEvmWallet) {
          this.setConnectedAccount(account.address, undefined, 'evm');
        } else if (
          this._accountId &&
          !account.isConnected &&
          (this.hasVerifiedConnection || isAddress(this._accountId)) &&
          !this.isInitializing
        ) {
          // Only clear account if we're not initializing AND it was an EVM wallet
          // This prevents wagmi from clearing other wallet types (TON, Solana, etc)
          if (this._walletType === 'evm' || isAddress(this._accountId)) {
            this.clearConnectedAccount();
          }
        }
      },
    );

    this.web3ModalUnsubscribe = web3Modal.subscribeState(() => {
      // Don't process state changes during initialization to prevent unwanted connection prompts
      if (this.isInitializing) return;

      this.syncConnectorState();

      try {
        const walletInfo = (web3Modal as any).getState?.();
        const isUsingAppkit =
          walletInfo?.selectedNetworkId?.includes?.('solana');
        const solanaAddress = isUsingAppkit
          ? (web3Modal as any).getAddress?.()
          : null;

        if (solanaAddress && !isAddress(solanaAddress)) {
          this.setConnectedAccount(solanaAddress, undefined, 'solana');
        } else if (
          this._accountId &&
          this._walletType === 'solana' &&
          !this.isInitializing
        ) {
          this.clearConnectedAccount();
        }
      } catch (e) {
        // Ignore state read errors
      }
    });
  }

  private async handleWalletConnection(payload: any): Promise<void> {
    const wallet = payload.wallet as any;
    const accountId =
      payload.accounts?.length > 0
        ? this.extractAccountId(payload.accounts[0])
        : (
            (await wallet.getAddress?.()) ||
            (await wallet.getPublicKey?.()) ||
            ''
          ).toString();

    if (accountId) {
      let walletType = '';
      if (hotConnectorInstance && wallet?.connector) {
        const idx = hotConnectorInstance.connectors.indexOf(wallet.connector);
        walletType = ['near', 'evm', 'solana', 'ton', 'stellar'][idx] || '';
      }
      this.setConnectedAccount(accountId, wallet, walletType);

      // Trigger verification callback if set and not yet verified
      if (this.onVerificationNeeded && !this._isVerified) {
        this.onVerificationNeeded();
      }
    }
  }

  private async ensureSelector(): Promise<void> {
    if (this.isInitialized && hotConnectorInstance) return;
    if (!this.selectorPromise) this.selectorPromise = this.initializeSelector();
    await this.selectorPromise;
  }

  private async initializeSelector(): Promise<void> {
    if (hotConnectorInstance) {
      this.isInitialized = true;
      return;
    }

    const config = wagmiAdapter.wagmiConfig;
    const evmConnector = evm({});
    evmConnector.connect = async () => {
      await web3Modal.open({ view: 'Connect' });
    };

    const origDisconnect = evmConnector.silentDisconnect.bind(evmConnector);
    evmConnector.silentDisconnect = async () => {
      await origDisconnect();
      await disconnect(config);
    };

    const solanaConnector = solana();
    solanaConnector.connect = async () => {
      await web3Modal.open({ view: 'Connect' });
    };

    // Temporarily suppress console errors during connector initialization
    // to prevent harmless wallet detection errors from showing
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const msg = args[0]?.toString() || '';
      // Suppress known harmless errors from wallet detection
      if (
        msg.includes('No wallet selected') ||
        msg.includes('not connected') ||
        msg.includes('message channel closed') ||
        msg.includes('WalletAlreadyConnectedError')
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    hotConnectorInstance = new HotConnector({
      connectors: [
        new NearConnector(new InnerNearConnector({ network: this.networkId })),
        evmConnector,
        solanaConnector,
        ton(),
        stellar(),
      ],
    });

    // Restore console.error after a short delay to allow connector initialization
    setTimeout(() => {
      console.error = originalConsoleError;
    }, 2000);

    this.isInitialized = true;

    if (!this.disconnectUnsubscribe) {
      this.disconnectUnsubscribe = hotConnectorInstance.onDisconnect(
        async (payload) => {
          if (this.isInitializing) return;
          const connector = payload?.wallet?.connector;
          if (!connector) return;

          const idx = hotConnectorInstance?.connectors.indexOf(connector) ?? -1;
          const walletType =
            idx >= 0 ? ['near', 'evm', 'solana', 'ton', 'stellar'][idx] : '';
          const isActive = walletType === this._walletType;

          if (isActive || this.isSigningOut) {
            // Only disconnect from web3Modal if we're disconnecting EVM or Solana AND it's the active wallet
            if (isActive && (walletType === 'evm' || walletType === 'solana')) {
              try {
                const config = wagmiAdapter.wagmiConfig;
                if (getAccount(config).isConnected) {
                  await disconnect(config);
                }
                await (web3Modal as any).disconnect?.();
              } catch (e) {
                // Ignore disconnect errors
              }
            }

            this.clearConnectedAccount();
            // Only show toast if this was an actual disconnect (not just opening the modal)
            if (isActive && !this.isSigningOut) {
              toast.success('Wallet disconnected', {
                toastId: 'wallet-disconnected',
              });
            }
            this.isSigningOut = false;
          }
        },
      );
    }
  }

  get selector() {
    return hotConnectorInstance;
  }
  get accountId() {
    return this._accountId;
  }
  get initialized() {
    return this.isInitialized;
  }
  get isVerified() {
    return this._isVerified;
  }

  callMethod = async ({
    args = {},
    contractId,
    deposit = '0',
    gas = '30000000000000',
    method,
  }: any) => {
    await this.ensureSelector();
    if (!this.selector || !this.walletInstance) return;
    return await this.walletInstance.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: { methodName: method, args, gas, deposit },
        },
      ],
    });
  };

  setVerificationCallback(callback: () => void) {
    this.onVerificationNeeded = callback;
  }

  requestVerificationSignature = async (): Promise<{
    signed: boolean;
    signature?: string;
  }> => {
    if (!this._accountId || !this.walletInstance) {
      throw new Error('No wallet connected');
    }

    const message = {
      deadline: new Date(Date.now() + 86400000).toISOString(), // 24h from now
      nonce: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
        'base64',
      ),
      verifying_contract: 'intents.near',
      signer_id: this._accountId,
      intents: [],
    };

    try {
      if (this._walletType === 'solana') {
        const provider = (web3Modal as any).getWalletProvider?.();
        if (provider?.signMessage) {
          const msgEncoded = new TextEncoder().encode(JSON.stringify(message));
          const { signature } = await provider.signMessage(msgEncoded);
          this._isVerified = true;
          return {
            signed: true,
            signature: Buffer.from(signature).toString('base64'),
          };
        }
      } else if (this._walletType === 'evm') {
        // EVM signing using wagmi would require importing signMessage from @wagmi/core
        // For now, use the wallet provider's signMessage if available
        const provider = (web3Modal as any).getWalletProvider?.();
        if (provider?.signMessage) {
          const signature = await provider.signMessage(JSON.stringify(message));
          this._isVerified = true;
          return { signed: true, signature };
        }
      } else if (this.walletInstance.signMessage) {
        // NEAR/TON/Stellar
        const signature = await this.walletInstance.signMessage(
          JSON.stringify(message),
        );
        this._isVerified = true;
        return { signed: true, signature };
      }
    } catch (error: any) {
      if (this.isCancellationError(error)) {
        return { signed: false };
      }
      throw error;
    }

    throw new Error(`Signing not supported for ${this._walletType}`);
  };

  signIn = async () => {
    await this.ensureSelector();
    if (!this.selector) return;

    this.unsubscribe?.();
    this.unsubscribe = this.selector.onConnect(async (payload) => {
      try {
        const wasVerified = this.hasVerifiedConnection;
        await this.handleWalletConnection(payload);
        if (this._accountId && !wasVerified)
          toast.success('Wallet connected', { toastId: 'wallet-connected' });
      } catch (error: any) {
        if (!this.isCancellationError(error))
          toast.error(error?.message || 'Failed to setup wallet connection');
      }
    });

    try {
      // Sync state before opening to ensure Hot Connector shows current account
      await this.syncConnectorState();
      await this.selector.connect();
    } catch (error: any) {
      if (!this.isCancellationError(error)) toast.error(error);
    }
  };

  signOut = async () => {
    if (this.startupPromise) await this.startupPromise;
    await this.ensureSelector();
    if (!this.selector) return;

    try {
      this.isSigningOut = true;
      // Sync state to ensure Hot Connector shows current account before opening
      await this.syncConnectorState();
      // Open Hot Connector modal for all wallet types
      // Modal will show connected account and allow disconnect through UI
      await this.selector.connect();
      setTimeout(() => {
        if (this.isSigningOut) this.isSigningOut = false;
      }, 5000);
    } catch (error: any) {
      this.isSigningOut = false;
      if (!this.isCancellationError(error))
        toast.error(error?.message || 'Failed to open wallet modal');
    }
  };

  startUp = async (network: string): Promise<void> => {
    if (this.startupPromise) return this.startupPromise;

    this.startupPromise = (async () => {
      this.isInitializing = true;
      this.networkId = network === 'testnet' ? 'testnet' : 'mainnet';

      const existingId = Cookies.get('signedAccountId');
      if (existingId) {
        this._accountId = existingId;
        this._walletType =
          Cookies.get(COOKIE_WALLET_TYPE) || this.inferWalletType(existingId);
      }

      this.setupWagmiListener();

      const wagmiAcc = getAccount(wagmiAdapter.wagmiConfig).address;
      // Only auto-set EVM account if we have a previous session (cookie exists)
      if (wagmiAcc && existingId && isAddress(existingId)) {
        this.setConnectedAccount(wagmiAcc, undefined, 'evm');
      }

      await this.ensureSelector();
      await this.syncConnectorState();

      if (this.isInitialized && this.selector && !this.unsubscribe) {
        this.unsubscribe = this.selector.onConnect(async (payload) => {
          try {
            await this.handleWalletConnection(payload);
          } catch {}
        });
      }

      this.isInitializing = false;
    })();

    return this.startupPromise;
  };

  getWallet = () => this.walletInstance;
}
