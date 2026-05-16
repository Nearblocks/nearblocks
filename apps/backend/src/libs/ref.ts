import { viewFunctionAsJson } from '@near-js/jsonrpc-client';
import axios from 'axios';

import { logger } from 'nb-logger';

import { createCache } from '#libs/cache';
import { rpc } from '#libs/rpc';
import { RefData } from '#types/types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const whitelistCache = createCache<string[]>(ONE_DAY_MS);

const price = async (): Promise<null | RefData> => {
  try {
    const resp = await axios.get(
      `https://indexer.ref.finance/list-token-price`,
      { timeout: 60000 },
    );

    return resp?.data ?? null;
  } catch (error) {
    logger.error(`price: ref.price`);
    logger.error(error);
    return null;
  }
};

const whitelist = async (): Promise<null | string[]> => {
  try {
    const cached = whitelistCache.get();
    if (cached) return cached;

    const data = await viewFunctionAsJson<string[]>(rpc, {
      accountId: 'v2.ref-finance.near',
      methodName: 'get_whitelisted_tokens',
    });

    if (data?.length) {
      whitelistCache.set(data);
      return data;
    }

    return null;
  } catch (error) {
    logger.error('ref: whitelist');
    logger.error(error);
    return null;
  }
};

export default { price, whitelist };
