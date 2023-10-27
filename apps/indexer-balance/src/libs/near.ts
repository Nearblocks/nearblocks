import axios from 'axios';

import config from '#config';

const request = axios.create({ baseURL: config.rpcUrl });

const query = async (params: unknown) =>
  request.post('', {
    id: 'near',
    jsonrpc: '2.0',
    method: 'query',
    params,
  });

export const bytesParse = (input: ArrayBuffer) =>
  JSON.parse(Buffer.from(input).toString());

export const bytesStringify = (input: unknown) =>
  Buffer.from(JSON.stringify(input)).toString('base64');

export const viewAccount = async (accountId: string, blockHash: string) =>
  query({
    account_id: accountId,
    block_id: blockHash,
    request_type: 'view_account',
  });
