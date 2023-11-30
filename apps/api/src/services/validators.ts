import { Response } from 'express';

import { cache } from '#libs/redis';
import catchAsync from '#libs/async';
import { EpochValidatorInfo, RequestValidator, ValidatorEpochData } from '#ts/types';
import { List } from '#libs/schema/blocks';
import { getProtocolConfig, getValidators, callJsonRpc } from '#libs/near';
import { mapValidators } from '#libs/validator';

const EXPIRY = 10; // 5 sec 
const HOUR = 3600; // 1 hour
const YEAR = 31536000
 
const list = catchAsync(async (req: RequestValidator<List>, res: Response) => { 
  console.log(req.headers)
  const genesisConfig = await cache(
    `validators:genesis-config`,
    async () => {
      try {
        const genesisProtocolConfig: any = await callJsonRpc('EXPERIMENTAL_genesis_config', {
          finality: "final",
        });
        return {
          height: genesisProtocolConfig.genesis_height,
          timestamp: new Date(genesisProtocolConfig.genesis_time).valueOf(),
          protocolVersion: genesisProtocolConfig.protocol_version,
          totalSupply: genesisProtocolConfig.total_supply,
          minStakeRatio: genesisProtocolConfig.minimum_stake_ratio,
        };
      } catch (error) {
        return null;
      }
    },
    { EX: YEAR },
  );

  const protocolConfig = await cache(
    `validators:protocolConfig`,
    async () => {
      try {
        return await getProtocolConfig(); 
      } catch (error) {
        return null;
      }
    },
    { EX: HOUR },
  );

  const validators = await cache(
    `validators:list`,
    async () => {
      try {
        return await getValidators();
      } catch (error) {
        return null;
      }
    },
    { EX: EXPIRY },
  );

  if (validators) {
    const nextValidators = cache(`validators:nextValidators`, validators?.next_validators, { EX: EXPIRY })
    const currentValidators = cache(`validators:currentValidators`, validators?.current_validators, { EX: EXPIRY })
    const epochStartHeight = cache(`validators:epochStartHeight`, validators?.epoch_start_height, { EX: EXPIRY })
    const mappedValidators = cache(`validators:mappedValidators`, mapValidators(validators, []), { EX: EXPIRY })
  }


  return res.status(200).json({ validators, genesisConfig, protocolConfig});
});


export default { list };