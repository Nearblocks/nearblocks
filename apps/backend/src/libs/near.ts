import { viewFunctionAsJson } from '@near-js/jsonrpc-client';
import { validators, viewAccount } from '@near-js/jsonrpc-client/no-validation';

import { logger } from 'nb-logger';

import { rpc } from '#libs/rpc';
import { encodeArgs } from '#libs/utils';
import {
  FTMetadata,
  MTContractMetadata,
  MTTokenMetadataInfo,
  NFTMetadata,
  NFTTokenInfo,
} from '#types/types';

export const fetchAccount = async (
  accountId: string,
  blockId: number | string,
) => {
  try {
    const account = await viewAccount(rpc, { accountId, blockId });

    return account;
  } catch (error) {
    logger.error(`near: fetchAccount: ${accountId}: ${blockId}`);
    logger.error(error);
  }

  return null;
};

export const fetchFTSupply = async (contract: string) => {
  try {
    const supply = await viewFunctionAsJson<string>(rpc, {
      accountId: contract,
      methodName: 'ft_total_supply',
    });

    return supply;
  } catch (error) {
    logger.error(`near: fetchFTSupply: ${contract}`);
    logger.error(error);
  }

  return null;
};

export const fetchFTMeta = async (contract: string) => {
  try {
    const meta = await viewFunctionAsJson<FTMetadata>(rpc, {
      accountId: contract,
      methodName: 'ft_metadata',
    });

    if (meta?.name && meta?.symbol) {
      return meta;
    }
  } catch (error) {
    logger.error(`near: fetchFTMeta: ${contract}`);
    logger.error(error);
  }

  return null;
};

export const fetchMTMeta = async (contract: string) => {
  try {
    const meta = await viewFunctionAsJson<MTContractMetadata>(rpc, {
      accountId: contract,
      methodName: 'mt_metadata_contract',
    });

    if (meta?.name) {
      return meta;
    }
  } catch (error) {
    logger.error(`near: fetchMTMeta: ${contract}`);
    logger.error(error);
  }

  return null;
};

export const fetchMTTokenMeta = async (contract: string, token: string) => {
  try {
    const metas = await viewFunctionAsJson<MTTokenMetadataInfo[]>(rpc, {
      accountId: contract,
      argsBase64: encodeArgs({ token_ids: [token] }),
      methodName: 'mt_metadata_token_all',
    });
    const meta = metas?.[0];

    if (meta?.base && meta?.token) {
      return meta;
    }
  } catch (error) {
    logger.error(`near: fetchMTTokenMeta: ${contract}: ${token}`);
    logger.error(error);
  }

  return null;
};

export const fetchNFTMeta = async (contract: string) => {
  try {
    const meta = await viewFunctionAsJson<NFTMetadata>(rpc, {
      accountId: contract,
      methodName: 'nft_metadata',
    });

    if (meta?.name) {
      return meta;
    }
  } catch (error) {
    logger.error(`near: fetchNFTMeta: ${contract}`);
    logger.error(error);
  }

  return null;
};

export const fetchNFTTokenMeta = async (contract: string, token: string) => {
  try {
    const meta = await viewFunctionAsJson<NFTTokenInfo>(rpc, {
      accountId: contract,
      argsBase64: encodeArgs({ token_id: token }),
      methodName: 'nft_token',
    });

    if (meta?.metadata) {
      return meta;
    }
  } catch (error) {
    logger.error(`near: fetchNFTTokenMeta: ${contract}: ${token}`);
    logger.error(error);
  }

  return null;
};

export const fetchValidators = async () => {
  try {
    const resp = await validators(rpc, 'latest');

    return resp;
  } catch (error) {
    logger.error(`near: fetchValidators`);
    logger.error(error);
  }

  return null;
};
