import { Response } from 'express';
import { cache, readCache } from '#libs/redis';
import catchAsync from '#libs/async';
import { RequestValidator, ValidatorEpochData } from '#ts/types';
import { List } from '#libs/schema/blocks';
import { getProtocolConfig, getValidators, callJsonRpc, callFunction } from '#libs/near';
import { accumulatedStakes, getValidatorsTimeout, mapValidators, validatorsSortFns } from '#libs/validator';
import { keyBinder, nsToMsTime } from '#libs/utils';
import db from '#libs/db';

const EXPIRY = 5; // 5 sec 
const HOUR = 3600; // 1 hour
const YEAR = 31536000
export const EMPTY_CODE_HASH = "11111111111111111111111111111111";


const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  console.log(req.headers)


  const latestBlock = await cache(
    `validators:latestBlock`,
    async () => {
      try {
        const limit = 1
        const { query, values } = keyBinder(
          `
            SELECT
              block_height,
              block_hash,
              block_timestamp,
              author_account_id,
              (
                SELECT
                  json_build_object(
                    'gas_used',
                    COALESCE(SUM (gas_used), 0)
                  )
                FROM
                  chunks
                WHERE
                  included_in_block_hash = blocks.block_hash
              ) AS chunks_agg,
              (
                SELECT
                  json_build_object(
                    'count',
                    COUNT (included_in_block_hash)
                  )
                FROM
                  transactions
                WHERE
                  included_in_block_hash = blocks.block_hash
              ) AS transactions_agg
            FROM
              blocks
            ORDER BY
              block_height DESC
            LIMIT $LIMIT
          `,
          { limit },
        );

        const { rows } = await db.query(query, values);

        return rows;
      } catch (error) {
        return null;
      }
    },
    { EX: EXPIRY },
  );

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
          {},
        );

        const { rows } = await db.query(query, values);

        return rows.map(({ accountId }) => accountId);
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
        }
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

  console.log({ validators })
  if (validators) {

    const epochStartBlock = await cache(
      `validators:epochStartBlock`,
      async () => {
        try {
          const epochBlockHeight = await readCache('validators:epochStartHeight')
          if (epochBlockHeight !== validators.epoch_start_height) {
            const epochStartBlock: any = await callJsonRpc('block', {
              block_id: validators.epoch_start_height,
            });
            return {
              height: epochStartBlock.header.height,
              timestamp: nsToMsTime(
                epochStartBlock.header.timestamp
              ),
              totalSupply: epochStartBlock.header.total_supply,
            }
          }
          return readCache('validators:epochStartBlock')
        } catch (error) {
          return null;
        }
      },
      { EX: getValidatorsTimeout(cache) },
    );


    const nextValidators = await cache(`validators:nextValidators`, () => {
      return validators?.next_validators
    }, { EX: EXPIRY })
    const currentValidators = await cache(`validators:currentValidators`, () => {
      return validators?.current_validators
    }, { EX: EXPIRY })
    const epochStartHeight = await cache(`validators:epochStartHeight`, () => {
      return validators?.epoch_start_height
    }, { EX: EXPIRY })
    const mappedValidators = await cache(`validators:mappedValidators`, () => {
      return mapValidators(validators, poolIdsCheck)
    }, { EX: EXPIRY })
    const cumulativeStake = await cache(`validators:cumulativeStake`, () => {
      return accumulatedStakes(validators)
    }, { EX: EXPIRY })

    const poolinfo = await cache(
      `validators:poolinfo`,
      async () => {
        try {
          for (const mappedValidator of mappedValidators) {
            const account: any = await callJsonRpc('view_account', {
              account_id: mappedValidator.accountId,
              finality: "final",
            });
            if (account.code_hash === EMPTY_CODE_HASH) {
              return {
                fee: null,
                delegatorsCount: null,
              };
            }
            const fee:any = await callFunction(mappedValidator.accountId, 'get_reward_fee_fraction', {} )
            const delegatorsCount:any = await callFunction(mappedValidator.accountId, 'get_number_of_accounts', {} )
            return {
              fee,
              delegatorsCount,
            };
          }
        } catch (error) {
          return null;
        }
      },
      { EX: 15 }, // 15 se
    );

    mappedValidators.map((validator:any) => ({
      ...validator,
      contractStake: poolinfo
    }))


  }


  return res.status(200).json({ validators, genesisConfig, protocolConfig });
});


export default { list };