import { Response } from 'express';
import { cache, readCache } from '#libs/redis';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { List } from '#libs/schema/blocks';
import {
  getProtocolConfig,
  getValidators,
  callJsonRpc,
  callFunction,
  viewAccount,
} from '#libs/near';
import {
  accumulatedStakes,
  getValidatorsTimeout,
  mapValidators,
} from '#libs/validator';
import { keyBinder, nsToMsTime } from '#libs/utils';
import db from '#libs/db';

const EXPIRY = 5; // 5 sec
const HOUR = 3600; // 1 hour
const YEAR = 31536000;
export const EMPTY_CODE_HASH = '11111111111111111111111111111111';

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = Number(req.query.page);
  const perPage = Number(req.query.per_page);

  console.log({ page, perPage });
  const latestBlock = await cache(
    `validators:latestBlock`,
    async () => {
      try {
        const limit = 1;
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
        const genesisProtocolConfig: any = await callJsonRpc(
          'EXPERIMENTAL_genesis_config',
          {
            finality: 'final',
          },
        );
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

  const expiry = await getValidatorsTimeout();

  const validators = await cache(
    `validators:list`,
    async () => {
      try {
        return await getValidators();
      } catch (error) {
        return null;
      }
    },
    { EX: expiry },
  );

  let combinedData: any = [];

  const epochStartBlock = await cache(
    `validators:epochStartBlock`,
    async () => {
      try {
        const epochBlockHeight = await readCache('validators:epochStartHeight');
        if (epochBlockHeight !== validators?.epoch_start_height) {
          const epochStartBlock: any = await callJsonRpc('block', {
            block_id: validators?.epoch_start_height,
          });
          return {
            height: epochStartBlock.header.height,
            timestamp: nsToMsTime(epochStartBlock.header.timestamp),
            totalSupply: epochStartBlock.header.total_supply,
          };
        }
        return readCache('validators:epochStartBlock');
      } catch (error) {
        return null;
      }
    },
    { EX: expiry },
  );

  const nextValidators = await cache(
    `validators:nextValidators`,
    () => {
      return validators?.next_validators;
    },
    { EX: EXPIRY },
  );
  const currentValidators = await cache(
    `validators:currentValidators`,
    () => {
      return validators?.current_validators;
    },
    { EX: EXPIRY },
  );
  const epochStartHeight = await cache(
    `validators:epochStartHeight`,
    () => {
      return validators?.epoch_start_height;
    },
    { EX: EXPIRY },
  );

  const mappedValidators = mapValidators(validators, poolIdsCheck);
  const cumulativeStake = await cache(
    `validators:cumulativeStake`,
    () => {
      return accumulatedStakes(mappedValidators);
    },
    { EX: EXPIRY },
  );

  const validatorList = mappedValidators.slice(
    page * perPage - perPage,
    page * perPage,
  );

  const poolinfo = await cache(
    `validators:poolinfo-${page}`,
    async () => {
      try {
        const poolInfo = [];
        for (const mappedValidator of validatorList) {
          const account: any = await viewAccount(mappedValidator.accountId);
          if (account.code_hash !== EMPTY_CODE_HASH) {
            const rawResult: any = await callFunction(
              mappedValidator.accountId,
              'get_reward_fee_fraction',
              {},
            );
            const fee = JSON.parse(Buffer.from(rawResult.result).toString());
            const delegatorsRow: any = await callFunction(
              mappedValidator.accountId,
              'get_number_of_accounts',
              {},
            );
            const delegatorsCount = JSON.parse(
              Buffer.from(delegatorsRow.result).toString(),
            );
            poolInfo.push({
              accountId: mappedValidator.accountId,
              fee,
              delegatorsCount,
            });
          }
        }
        return poolInfo;
      } catch (error) {
        return [];
      }
    },
    { EX: 300 }, // 15 se
  );

  const stakingPoolStakeProposalsFromContract = await cache(
    `validators:stakingPoolStakeProposalsFromContract-${page}`,
    async () => {
      try {
        return validatorList
          .filter((validator: any) => !validator.currentEpoch)
          .map(async (validator: any) => {
            const rawResult: any = await callFunction(
              validator.accountId,
              'get_total_staked_balance',
              {},
            );
            const contractStake = JSON.parse(
              Buffer.from(rawResult.result).toString(),
            );
            console.log({ contractStake });
            return {
              accountId: validator.accountId,
              contractStake,
            };
          });
      } catch (error) {
        return null;
      }
    },
    { EX: 300 }, // 15 se
  );

  combinedData = mappedValidators.map((validator: any) => {
    const matchingPoolInfo = poolinfo.find(
      (info: any) => info.accountId === validator.accountId,
    );
    const stakingPool = stakingPoolStakeProposalsFromContract.find(
      (info: any) => info.accountId === validator.accountId,
    );

    const validatorInfo = {
      ...validator,
      poolInfo: matchingPoolInfo
        ? {
            fee: matchingPoolInfo.fee,
            delegatorsCount: matchingPoolInfo.delegatorsCount,
          }
        : {},
      contractStake: stakingPool ? stakingPool.contractStake : null,
    };

    return validatorInfo;
  });

  return res
    .status(200)
    .json({
      combinedData,
      latestBlock,
      genesisConfig,
      protocolConfig,
      epochStartBlock,
      epochStartHeight,
      currentValidators,
      nextValidators,
      cumulativeStake,
    });
});

export default { list };
