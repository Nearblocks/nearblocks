import axios from 'axios';

import config from '#config';

const request = axios.create({ baseURL: config.rpcUrl });

const query = async (params: any) =>
  request.post('', {
    jsonrpc: '2.0',
    id: 'near',
    method: 'query',
    params,
  });

export const bytesParse = (input: ArrayBuffer) =>
  JSON.parse(Buffer.from(input).toString());

export const bytesStringify = (input: any) =>
  Buffer.from(JSON.stringify(input)).toString('base64');

export const viewAccount = async (accountId: string, blockHash: string) =>
  query({
    request_type: 'view_account',
    account_id: accountId,
    block_id: blockHash,
  });
