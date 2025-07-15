import { bytesParse, callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import { MtMetadata, RPCResponse } from '#types/types';

const provider = getProvider();

export const fetchMeta = async (
  contract: string,
  token_id: string,
  EXPIRY = 60,
): Promise<MtMetadata[]> => {
  const cacheKey = `nep245:${contract}:meta:${token_id}`;

  const metas = await redis.cache(
    cacheKey,
    async () => {
      const response: RPCResponse = await callFunction(
        provider,
        contract,
        'mt_metadata_token_all',
        { token_ids: [token_id] },
      );
      return bytesParse(response.result) as MtMetadata[];
    },
    EXPIRY,
  );

  return metas;
};
