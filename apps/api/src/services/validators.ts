import { getValidatorsTimeout } from './../libs/validator';
import { Response } from 'express';

import { cache } from '#libs/redis';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { List } from '#libs/schema/blocks';
import { getProtocolConfig, getValidators, callJsonRpc } from '#libs/near';
import { accumulatedStakes, getValidatorsTimeout, mapValidators, validatorsSortFns } from '#libs/validator';
import Big from 'big.js';
import { keyBinder } from '#libs/utils';
import db from '#libs/db';

const EXPIRY = 10; // 5 sec 
const HOUR = 3600; // 1 hour
const YEAR = 31536000
 
const list = catchAsync(async (req: RequestValidator<List>, res: Response) => { 
  console.log(req.headers)


  const poolIdsCheck = await cache(
    `validators:poolIdsCheck`,
    async () => {
      try {
        const { query, values } = keyBinder(
          `
            SELECT
              *
            FROM
              accounts
            WHERE
            account_id like '%.poolv1.near%'
          `,
          {  },
        );
    
        const { rows } = await db.query(query, values);
     
        return  rows.map(({ accountId }) => accountId);
      } catch (error) {
        return null;
      }
    },
    { EX: 600 }, // 10 minute
  );


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
    { EX: getValidatorsTimeout(cache) },
  );
console.log({validators})
  if (validators) {
    const nextValidators = await cache(`validators:nextValidators`,   () => {
      return validators?.next_validators
    } , { EX: EXPIRY })
    const currentValidators = await cache(`validators:currentValidators`, () => {
      return validators?.current_validators
    }, { EX: EXPIRY })
    const epochStartHeight = await cache(`validators:epochStartHeight`, () => {
      return validators?.epoch_start_height
    } , { EX: EXPIRY })
    const mappedValidators = await cache(`validators:mappedValidators`, () => {
      return mapValidators(validators, poolIdsCheck)
    } , { EX: EXPIRY })
    const cumulativeStake = await cache(`validators:cumulativeStake`, () => {
      return accumulatedStakes(validators)
    } , { EX: EXPIRY })




  }


  return res.status(200).json({ validators, genesisConfig, protocolConfig});
});


export default { list };