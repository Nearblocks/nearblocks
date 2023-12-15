import {
  AccountView,
  BlockResult,
  EpochValidatorInfo,
  validatorApi,
} from 'nb-near';
import { ValidatorEpochData, ValidatorPoolInfo } from 'nb-types';

import config from '#config';
import db from '#libs/knex';
import RPC from '#libs/near';
import { cache, readCache, redis } from '#libs/redis';
import { DAY, HOUR, validator } from '#libs/utils';
import {
  CachedTimestampMap,
  ExpGenesisConfig,
  ExpProtocolConfig,
  RegularCheckFn,
} from '#types/types';

export const EMPTY_CODE_HASH = '11111111111111111111111111111111';

export const latestBlockCheck: RegularCheckFn = {
  fn: async () => {
    const { data } = await RPC.query(
      {
        finality: 'final',
      },
      'block',
    );
    if (data.result) {
      const latestBlock = data.result as BlockResult;
      await cache(
        `latestBlock`,
        {
          height: latestBlock?.header?.height,
          timestamp: latestBlock?.header?.timestamp,
        },
        { EX: HOUR },
      );
    }
  },
};

export const protocolConfigCheck: RegularCheckFn = {
  fn: async () => {
    const { data } = await RPC.query(
      {
        finality: 'final',
      },
      'EXPERIMENTAL_protocol_config',
    );
    if (data.result) {
      const protocolConfig = data.result as ExpProtocolConfig;
      if (protocolConfig) {
        await cache(
          'protocolConfig',
          {
            epochLength: protocolConfig.epoch_length,
            maxNumberOfSeats:
              protocolConfig.num_block_producer_seats +
              protocolConfig.avg_hidden_validator_seats_per_shard.reduce(
                (seats, seat) => seats + seat,
                0,
              ),
            version: protocolConfig.protocol_version,
          },
          { EX: HOUR },
        );
      }
    }
  },
};

export const genesisProtocolInfoFetch: RegularCheckFn = {
  fn: async () => {
    const [{ data }, genesisAccount] = await Promise.all([
      RPC.query(
        {
          finality: 'final',
        },
        'EXPERIMENTAL_genesis_config',
      ),
      db('accounts').count('account_id').whereNull('created_by_receipt_id'),
    ]);

    if (data.result && genesisAccount) {
      const genesisAccountCount = genesisAccount[0].count;
      const genesisProtocolConfig = data.result as ExpGenesisConfig;
      await cache(
        'genesisConfig',
        {
          accountCount: genesisAccountCount,
          height: genesisProtocolConfig.genesis_height,
          minStakeRatio: genesisProtocolConfig.minimum_stake_ratio,
          protocolVersion: genesisProtocolConfig.protocol_version,
          timestamp: new Date(genesisProtocolConfig.genesis_time).valueOf(),
          totalSupply: genesisProtocolConfig.total_supply,
        },
        { EX: DAY },
      );
    }
  },
};

export const poolIdsCheck: RegularCheckFn = {
  fn: async () => {
    const network = config.network;
    const address =
      network === 'mainnet'
        ? `${validator.accountIdSuffix.stakingPool.mainnet}`
        : `${validator.accountIdSuffix.stakingPool.testnet}`;
    const rows = await db('accounts')
      .select('account_id')
      .whereLike('account_id', `%${address}`);

    const accounts = rows.map((data) => {
      return data.account_id;
    });
    await cache('poolIds', accounts, { EX: DAY });
  },
};

// const getValidatorsTimeout = async () => {
//     const epochStartBlock = await readCache('epochStartBlock') as BlockHeaderInnerLiteView
//     const latestBlock = await readCache('latestBlock') as LatestBlock
//     const protocolConfig = await readCache('protocolConfig') as GenesisConfig
//     if (!latestBlock || !epochStartBlock || !protocolConfig) {
//          return 15 * SECOND;
//     }
//     const epochProgress =
//         (latestBlock.height - epochStartBlock?.height) / protocolConfig?.epochLength;
//     const timeRemaining =
//         (latestBlock.timestamp - epochStartBlock?.timestamp) * (1 - epochProgress);
//     if (timeRemaining > 0) {
//         return  Math.max(SECOND, timeRemaining / 2);
//     }
//      return 15 * SECOND;
// };

const getValidators = async () => {
  const { data } = await RPC.query([null], 'validators');
  if (data.result) {
    const validator = data.result as EpochValidatorInfo;
    await cache('validatorsPromise', validator, { EX: DAY });
    return validator;
  }
  return null;
};

const mapValidators = (
  epochStatus: EpochValidatorInfo,
  poolIds: string[],
): ValidatorEpochData[] => {
  const validatorsMap: Map<string, ValidatorEpochData> = new Map();

  for (const currentValidator of epochStatus.current_validators) {
    validatorsMap.set(currentValidator.account_id, {
      accountId: currentValidator.account_id,
      currentEpoch: {
        progress: {
          blocks: {
            produced: currentValidator.num_produced_blocks,
            total: currentValidator.num_expected_blocks,
          },
          chunks: {
            produced: currentValidator.num_produced_blocks,
            total: currentValidator.num_expected_blocks,
          },
        },
        stake: currentValidator.stake,
      },
      publicKey: currentValidator.public_key,
    });
  }

  for (const nextValidator of epochStatus.next_validators) {
    const validator = validatorsMap.get(nextValidator.account_id) || {
      accountId: nextValidator.account_id,
      publicKey: nextValidator.public_key,
    };
    validator.nextEpoch = {
      stake: nextValidator.stake,
    };
    validatorsMap.set(nextValidator.account_id, validator);
  }

  for (const nextProposal of epochStatus.current_proposals) {
    const validator = validatorsMap.get(nextProposal.account_id) || {
      accountId: nextProposal.account_id,
      publicKey: nextProposal.public_key,
    };
    validator.afterNextEpoch = {
      stake: nextProposal.stake,
    };
    validatorsMap.set(nextProposal.account_id, validator);
  }
  for (const accountId of poolIds) {
    const validator = validatorsMap.get(accountId) || {
      accountId,
    };
    validatorsMap.set(accountId, validator);
  }

  return [...validatorsMap.values()];
};

const fetchStakingPoolInfo = async () => {
  const validators = (await readCache(
    redis.getPrefixedKeys('mappedValidators'),
  )) as ValidatorEpochData[];

  if (validators && validators.length > 0) {
    const mappings = {
      promisesMap: new Map(),
      timestampMap: new Map(),
      valueMap: new Map(),
    };

    const updatePromise = async (id: string) => {
      try {
        const { data } = await RPC.callFunction(
          id,
          'get_total_staked_balance',
          RPC.encodeArgs({}),
        );
        if (data.result) {
          const result = JSON.parse(Buffer.from(data.result.result).toString());
          mappings.valueMap.set(id, result);
        }
      } catch (e) {
        mappings.promisesMap.delete(id);
      }
    };

    const ids = validators
      .filter((validator) => !validator.currentEpoch)
      .map((validator) => validator.accountId);

    for (const id of ids) {
      mappings.timestampMap.set(id, Date.now());
      if (!mappings.promisesMap.get(id)) {
        mappings.promisesMap.set(id, updatePromise(id));
      }
    }

    await Promise.all(ids.map((id) => mappings.promisesMap.get(id)));

    if (mappings.valueMap.size > 0) {
      const mappingsnew = {
        valueMap: new Map([...mappings.valueMap]),
      };
      await cache(
        'stakingPoolStakeProposalsFromContract',
        Array.from(mappingsnew.valueMap.entries()),
        { EX: DAY },
      );
      await saveValidatorLists();
    }
  }
};

export const updateStakingPoolStakeProposalsFromContractMap: RegularCheckFn = {
  fn: async () => {
    const stakingPoolStakeProposalsFromContract = await readCache(
      redis.getPrefixedKeys('stakingPoolStakeProposalsFromContract'),
    );

    if (!stakingPoolStakeProposalsFromContract) {
      await fetchStakingPoolInfo();
    }
  },
};

const fetchPoolInfo = async () => {
  const validators = (await readCache(
    redis.getPrefixedKeys('mappedValidators'),
  )) as ValidatorEpochData[];

  if (validators && validators.length > 0) {
    const mappings = {
      promisesMap: new Map(),
      timestampMap: new Map(),
      valueMap: new Map(),
    };

    const updatePromise = async (id: string) => {
      try {
        const { data } = await RPC.query(
          {
            account_id: id,
            finality: 'final',
            request_type: 'view_account',
          },
          'query',
        );

        const account = data.result as AccountView;
        if (account.code_hash !== EMPTY_CODE_HASH) {
          const { data } = await RPC.callFunction(
            id,
            'get_number_of_accounts',
            RPC.encodeArgs({}),
          );
          const delegatorsCount = RPC.decodeResult(data.result.result);

          const { data: feeData } = await RPC.callFunction(
            id,
            'get_reward_fee_fraction',
            RPC.encodeArgs({}),
          );
          const fee = RPC.decodeResult(feeData.result.result);

          const result = {
            delegatorsCount,
            fee,
          };
          // Correctly set the value in mappings.valueMap
          mappings.valueMap.set(id, result);
        }
      } catch (e) {
        mappings.promisesMap.delete(id);
      }
    };

    const ids = validators.map((validator) => validator.accountId);

    for (const id of ids) {
      mappings.timestampMap.set(id, Date.now());
      if (!mappings.promisesMap.get(id)) {
        mappings.promisesMap.set(id, updatePromise(id));
      }
    }

    await Promise.all(ids.map((id) => mappings.promisesMap.get(id)));

    if (mappings.valueMap.size > 0) {
      const mappingsnew = {
        valueMap: new Map([...mappings.valueMap]),
      };
      await cache(
        'stakingPoolInfos',
        Array.from(mappingsnew.valueMap.entries()),
        { EX: DAY },
      );
      await saveValidatorLists();
    }
  }
};

export const updatePoolInfoMap: RegularCheckFn = {
  fn: async () => {
    const stakingPoolInfos = await readCache(
      redis.getPrefixedKeys('stakingPoolInfos'),
    );
    if (!stakingPoolInfos) {
      await fetchPoolInfo();
    }
  },
};

const saveValidatorLists = async () => {
  const mappedValidators = (await readCache(
    redis.getPrefixedKeys('mappedValidators'),
  )) as ValidatorEpochData[];

  if (mappedValidators.length > 0) {
    const stakingPoolStakeProposalsFromContract = (await readCache(
      redis.getPrefixedKeys('stakingPoolStakeProposalsFromContract'),
    )) as CachedTimestampMap<string>;

    let stakingPoolStakeProposals = new Map();
    if (
      stakingPoolStakeProposalsFromContract &&
      Array.isArray(stakingPoolStakeProposalsFromContract)
    ) {
      stakingPoolStakeProposals = new Map(
        stakingPoolStakeProposalsFromContract,
      );
    }

    const stakingPoolInfos = (await readCache(
      redis.getPrefixedKeys('stakingPoolInfos'),
    )) as CachedTimestampMap<ValidatorPoolInfo>;

    let stakingPoolInfosData = new Map();
    if (stakingPoolInfos && Array.isArray(stakingPoolInfos)) {
      stakingPoolInfosData = new Map(stakingPoolInfos);
    }

    const combined = mappedValidators.map((validator, index: number) => ({
      ...validator,
      contractStake: stakingPoolStakeProposals.has(validator.accountId)
        ? stakingPoolStakeProposals?.get(validator.accountId)
        : null,
      index,
      poolInfo: stakingPoolInfosData.has(validator.accountId)
        ? stakingPoolInfosData.get(validator.accountId)
        : null,
    }));

    await cache('validatorLists', combined, { EX: DAY });
  }
};

export const validatorsCheck: RegularCheckFn = {
  fn: async () => {
    const validators = (await getValidators()) as EpochValidatorInfo;

    if (validators) {
      const poolIds = await readCache(redis.getPrefixedKeys('poolIds'));
      const genesisConfig = await readCache(
        redis.getPrefixedKeys('genesisConfig'),
      );
      const protocolConfig = await readCache(
        redis.getPrefixedKeys('protocolConfig'),
      );

      const mappedValidators = mapValidators(validators, poolIds ?? []);

      await cache('mappedValidators', mappedValidators, { EX: DAY });

      await cache('currentValidators', validators.current_validators, {
        EX: DAY,
      });

      await cache('nextValidators', validators.next_validators, { EX: DAY });

      if (genesisConfig && protocolConfig) {
        const seatPrice = await validatorApi.findSeatPrice(
          validators.current_validators,
          protocolConfig.maxNumberOfSeats,
          genesisConfig.minStakeRatio,
          protocolConfig.version,
        );
        await cache('epochStatsCheck', seatPrice.toString(), { EX: DAY });
      }
      const { data } = await RPC.query(
        {
          block_id: validators.epoch_start_height,
        },
        'block',
      );

      const epochStartBlocks = data.result as BlockResult;

      if (epochStartBlocks) {
        await cache(
          'epochStartBlock',
          {
            height: epochStartBlocks.header.height,
            timestamp: epochStartBlocks.header.timestamp,
            total_supply: epochStartBlocks.header.total_supply,
          },
          { EX: DAY },
        );
      }

      await Promise.all([
        Promise.race([
          fetchStakingPoolInfo(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 25000),
          ),
        ]),
        Promise.race([
          fetchPoolInfo(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 25000),
          ),
        ]),
      ]);

      await saveValidatorLists();
    }
  },
};
