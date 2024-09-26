import type { FetcherModule } from '@/libs/fetcher';
type getAccount = <T>(url: string, query: string) => Promise<T>;
type getBlock = <T>(url: string, query: number | string) => Promise<T>;
type getTxn = <T>(url: string, query: string) => Promise<T>;
type getReceipt = <T>(url: string, query: string) => Promise<T>;
export type RPCModule = {
  getAccount: getAccount;
  getBlock: getBlock;
  getReceipt: getReceipt;
  getTxn: getTxn;
};
const rpc = () => {
  let { retryFetch } = VM.require<FetcherModule>(
    `${config_account}/widget/lite.libs.fetcher`,
  );
  const providers = (networkId: string) => {
    return networkId === 'mainnet'
      ? [
          {
            name: 'NEAR (Archival)',
            url: 'https://archival-rpc.mainnet.near.org',
          },
          {
            name: 'NEAR',
            url: 'https://rpc.mainnet.near.org',
          },
          {
            name: 'NEAR (Beta)',
            url: 'https://beta.rpc.mainnet.near.org',
          },
          {
            name: 'fast-near web4',
            url: 'https://rpc.web4.near.page',
          },
          {
            name: 'FASTNEAR Free',
            url: 'https://free.rpc.fastnear.com',
          },
          {
            name: 'Lava Network',
            url: 'https://near.lava.build',
          },
          {
            name: 'Lavender.Five',
            url: 'https://near.lavenderfive.com/',
          },
          {
            name: 'dRPC',
            url: 'https://near.drpc.org',
          },
          {
            name: 'OMNIA',
            url: 'https://endpoints.omniatech.io/v1/near/mainnet/public',
          },
        ]
      : [
          {
            name: 'NEAR (Archival)',
            url: 'https://archival-rpc.testnet.near.org',
          },
          {
            name: 'NEAR',
            url: 'https://rpc.testnet.near.org',
          },
          {
            name: 'NEAR (Beta)',
            url: 'https://beta.rpc.testnet.near.org',
          },
        ];
  };
  const getAccount: getAccount = <T>(
    rpcUrl: string,
    accountId: string,
  ): Promise<T> => {
    const options: FetchOptions = {
      body: JSON.stringify({
        id: 'near',
        jsonrpc: '2.0',
        method: 'query',
        params: {
          account_id: accountId,
          finality: 'final',
          request_type: 'view_account',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };
    return new Promise((resolve, reject) => {
      retryFetch(rpcUrl, options)
        .then((response) => {
          resolve(response.body as T);
        })
        .catch(reject);
    });
  };

  const getBlock: getBlock = <T>(
    rpcUrl: string,
    blockId: number | string,
  ): Promise<T> => {
    const options: FetchOptions = {
      body: JSON.stringify({
        id: 'near',
        jsonrpc: '2.0',
        method: 'block',
        params: { block_id: blockId },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };
    return new Promise((resolve, reject) => {
      retryFetch(rpcUrl, options)
        .then((response) => {
          resolve(response.body as T);
        })
        .catch(reject);
    });
  };

  const getTxn: getTxn = <T>(rpcUrl: string, txnHash: string): Promise<T> => {
    const options: FetchOptions = {
      body: JSON.stringify({
        id: 'near',
        jsonrpc: '2.0',
        method: 'tx',
        params: {
          sender_account_id: 'bowen',
          tx_hash: txnHash,
          wait_until: 'NONE',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };
    return new Promise((resolve, reject) => {
      retryFetch(rpcUrl, options)
        .then((response) => {
          resolve(response.body as T);
        })
        .catch(reject);
    });
  };

  const getReceipt: getReceipt = <T>(
    rpcUrl: string,
    receiptId: string,
  ): Promise<T> => {
    const options: FetchOptions = {
      body: JSON.stringify({
        id: 'near',
        jsonrpc: '2.0',
        method: 'view_receipt_record',
        params: { receipt_id: receiptId },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };
    return new Promise((resolve, reject) => {
      retryFetch(rpcUrl, options)
        .then((response) => {
          resolve(response.body as T);
        })
        .catch(reject);
    });
  };
  return { getAccount, getBlock, getReceipt, getTxn, providers };
};

export default rpc;
