import { Response } from 'express';
import { providers } from 'near-api-js';

import catchAsync from '#libs/async';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import { mtMetadata, RequestValidator, RPCResponse } from '#types/types';

type TokenId = {
  token_ids: string[];
};

const EXPIRY = 60;
const provider = getProvider();

export const Metadata = async <T>(
  provider: providers.JsonRpcProvider,
  tokenIds: string[],
): Promise<T> => {
  try {
    return redis.cache(
      `nep245:tokens:${JSON.stringify(tokenIds)}`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'v2_1.omni.hot.tg',
          'mt_metadata_token_all',
          {
            token_ids: tokenIds,
          },
        );

        return bytesParse(response.result);
      },
      EXPIRY,
    );
  } catch (error) {
    return [] as T;
  }
};

const nep245 = catchAsync(
  async (req: RequestValidator<TokenId>, res: Response) => {
    const tokenIds = req.validator.data.token_ids;

    const metas = await Metadata<mtMetadata[]>(provider, tokenIds);

    return res.status(200).json({ nep245: metas });
  },
);

export default { nep245 };
