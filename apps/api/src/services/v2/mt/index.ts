import { Response } from 'express';

import catchAsync from '#libs/async';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import { mtMetadata, RequestValidator, RPCResponse } from '#types/types';

const EXPIRY = 60;
const provider = getProvider();

type MetaRequest = {
  contract: string;
  token_ids: string[];
};

const metaData = catchAsync(
  async (req: RequestValidator<MetaRequest>, res: Response) => {
    const contract = req.query.contract as string;
    const token_ids = (req.query.token_ids as string)?.split(',') ?? [];

    const tokenId = [...token_ids].sort();
    const cacheKey = `nep245:${contract}:meta:${JSON.stringify(tokenId)}`;

    const metas = await redis.cache(
      cacheKey,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          contract,
          'mt_metadata_token_all',
          {
            token_ids: tokenId,
          },
        );

        return bytesParse(response.result) as mtMetadata[];
      },
      EXPIRY,
    );

    return res.status(200).json(metas);
  },
);

export default { metaData };
