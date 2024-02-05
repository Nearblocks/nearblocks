import { RPC } from 'nb-near';

import config from '#config';
import { FTMetadata, NFTMetadata, NFTTokenInfo } from '#types/types.js';

const near = new RPC(config.rpcUrl);

export const nearBalance = async (
  account: string,
  block: number | string,
): Promise<null | string> => {
  const { data } = await near.viewAccount(account, block);

  if (data.result) {
    return data.result.amount;
  }

  return null;
};

export const ftBalance = async (
  near: RPC,
  contract: string,
  account: string,
  block: number | string,
) => {
  const { data } = await near.callFunction(
    contract,
    'ft_balance_of',
    near.encodeArgs({ account_id: account }),
    block,
  );

  if (data.result) {
    return near.decodeResult<string>(data.result.result, 'base64');
  }

  return null;
};

export const ftMeta = async (contract: string) => {
  const { data } = await near.callFunction(contract, 'ft_metadata', '');

  if (data.result) {
    return near.decodeResult<FTMetadata>(data.result.result);
  }

  return null;
};

export const ftTotalSupply = async (contract: string) => {
  const { data } = await near.callFunction(contract, 'ft_total_supply', '');

  if (data.result) {
    return near.decodeResult<string>(data.result.result);
  }

  return null;
};

export const nftMeta = async (contract: string) => {
  const { data } = await near.callFunction(contract, 'nft_metadata', '');

  if (data.result) {
    return near.decodeResult<NFTMetadata>(data.result.result);
  }

  return null;
};

export const nftTokenMeta = async (contract: string, tokenId: string) => {
  const args = near.encodeArgs({ token_id: tokenId });
  const { data } = await near.callFunction(contract, 'nft_token', args);

  if (data.result) {
    return near.decodeResult<NFTTokenInfo>(data.result.result);
  }

  return null;
};

export default near;
