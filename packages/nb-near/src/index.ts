import axios, { AxiosInstance } from 'axios';

export type { AccountView } from 'near-api-js/lib/providers/provider.js';

export class RPC {
  request: AxiosInstance;

  constructor(baseURL: string) {
    this.request = axios.create({ baseURL });
  }

  async query(params: unknown) {
    return this.request.post('', {
      id: 'near',
      jsonrpc: '2.0',
      method: 'query',
      params,
    });
  }

  async viewAccount(accountId: string, blockHash: string) {
    return this.query({
      account_id: accountId,
      block_id: blockHash,
      request_type: 'view_account',
    });
  }
}
