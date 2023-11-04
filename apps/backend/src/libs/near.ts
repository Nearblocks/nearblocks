import axios from 'axios';

import config from '#config';
import { decodeResults } from '#libs/utils';
import { FtMetadata, NftMetadata, NftTokenInfo } from '#types/types';

const rpcQuery = async (method: string, params: unknown) => {
  return axios.post(config.rpcUrl, {
    id: 'dontcare',
    jsonrpc: '2.0',
    method,
    params,
  });
};

export const validators = async () => {
  const response = await rpcQuery('validators', [null]);

  return Number(response?.data?.result?.current_validators?.length || 0);
};

export const ftMeta = async (contract: string): Promise<FtMetadata> => {
  const response = await rpcQuery('query', {
    account_id: contract,
    args_base64: '',
    finality: 'final',
    method_name: 'ft_metadata',
    request_type: 'call_function',
  });

  return decodeResults<FtMetadata>(response.data?.result?.result);
};

export const ftTotalSupply = async (contract: string): Promise<string> => {
  const response = await rpcQuery('query', {
    account_id: contract,
    args_base64: '',
    finality: 'final',
    method_name: 'ft_total_supply',
    request_type: 'call_function',
  });

  return decodeResults<string>(response.data?.result?.result);
};

export const nftMeta = async (contract: string): Promise<NftMetadata> => {
  const response = await rpcQuery('query', {
    account_id: contract,
    args_base64: '',
    finality: 'final',
    method_name: 'nft_metadata',
    request_type: 'call_function',
  });

  return decodeResults<NftMetadata>(response.data?.result?.result);
};

export const nftTokenMeta = async (
  contract: string,
  token: string,
): Promise<NftTokenInfo> => {
  const args = Buffer.from(
    JSON.stringify({
      token_id: token,
    }),
  ).toString('base64');

  const response = await rpcQuery('query', {
    account_id: contract,
    args_base64: args,
    finality: 'final',
    method_name: 'nft_token',
    request_type: 'call_function',
  });

  return decodeResults<NftTokenInfo>(response.data?.result?.result);
};
