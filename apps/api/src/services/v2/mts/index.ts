import { Response } from 'express';

import catchAsync from '#libs/async';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import { mtMetadata, RequestValidator, RPCResponse } from '#types/types';

const EXPIRY = 60;
const provider = getProvider();

type MetaRequest = {
  contract: string;
  token_id: string;
};

const metaData = catchAsync(
  async (req: RequestValidator<MetaRequest>, res: Response) => {
    const { contract, token_id } = req.validator.data;

    const cacheKey = `nep245:${contract}:meta:${token_id}`;
    const metas = await redis.cache(
      cacheKey,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          contract,
          'mt_metadata_token_all',
          {
            token_ids: [token_id],
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
