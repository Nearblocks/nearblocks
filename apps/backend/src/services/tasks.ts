import {
  AccountView,
  BlockResult,
  EpochValidatorInfo,
  validatorApi,
} from 'nb-near';
import { Redis } from 'nb-redis';
import {
  ValidatorEpochData,
  ValidatorPoolInfo,
  ValidatorTelemetry,
} from 'nb-types';

import config from '#config';
import db from '#libs/knex';
import RPC from '#libs/near';
import { DAY, HOUR, MINUTE, validator } from '#libs/utils';
import {
  CachedTimestampMap,
  ExpGenesisConfig,
  ExpProtocolConfig,
  PoolMetadataAccountInfo,
} from '#types/types';

export const EMPTY_CODE_HASH = '11111111111111111111111111111111';

export const latestBlockCheck = async (redis: Redis) => {
  const { data } = await RPC.query({ finality: 'final' }, 'block');

  if (data.result) {
    const latestBlock = data.result as BlockResult;
    await redis.stringify(
      `latestBlock`,
      {
        height: latestBlock?.header?.height,
        timestamp: latestBlock?.header?.timestamp,
      },
      MINUTE,
    );
  }
};

export const protocolConfigCheck = async (redis: Redis) => {
  const { data } = await RPC.query(
    { finality: 'final' },
    'EXPERIMENTAL_protocol_config',
  );

  if (data.result) {
    const protocolConfig = data.result as ExpProtocolConfig;

    if (protocolConfig) {
      await redis.stringify(
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
        HOUR,
      );
    }
  }
};

export const genesisProtocolInfoFetch = async (redis: Redis) => {
  const [{ data }, genesisAccount] = await Promise.all([
    RPC.query({ finality: 'final' }, 'EXPERIMENTAL_genesis_config'),
    db('accounts').count('account_id').whereNull('created_by_receipt_id'),
  ]);

  if (data.result && genesisAccount) {
    const genesisAccountCount = genesisAccount[0].count;
    const genesisProtocolConfig = data.result as ExpGenesisConfig;

    await redis.stringify(
      'genesisConfig',
      {
        accountCount: genesisAccountCount,
        height: genesisProtocolConfig.genesis_height,
        minStakeRatio: genesisProtocolConfig.minimum_stake_ratio,
        protocolVersion: genesisProtocolConfig.protocol_version,
        timestamp: new Date(genesisProtocolConfig.genesis_time).valueOf(),
        totalSupply: genesisProtocolConfig.total_supply,
      },
      DAY,
    );
  }
};

export const poolIdsCheck = async (redis: Redis) => {
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

  await redis.stringify('poolIds', accounts, DAY);
};

const getValidators = async (redis: Redis) => {
  const { data } = await RPC.query([null], 'validators');

  if (data.result) {
    const validator = data.result as EpochValidatorInfo;
    await redis.stringify('validatorsPromise', validator, DAY);

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

const fetchStakingPoolInfo = async (redis: Redis) => {
  const validators = (await redis.parse(
    'mappedValidators',
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

      await redis.stringify(
        'stakingPoolStakeProposalsFromContract',
        Array.from(mappingsnew.valueMap.entries()),
        DAY,
      );
      await saveValidatorLists(redis);
    }
  }
};

export const updateStakingPoolStake = async (redis: Redis) => {
  const stakingPoolStakeProposalsFromContract = await redis.parse(
    'stakingPoolStakeProposalsFromContract',
  );

  if (!stakingPoolStakeProposalsFromContract) {
    await fetchStakingPoolInfo(redis);
  }
};

const fetchPoolInfo = async (redis: Redis) => {
  const validators = (await redis.parse(
    'mappedValidators',
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
      await redis.stringify(
        'stakingPoolInfos',
        Array.from(mappingsnew.valueMap.entries()),
        DAY,
      );
      await saveValidatorLists(redis);
    }
  }
};

export const updatePoolInfoMap = async (redis: Redis) => {
  const stakingPoolInfos = await redis.parse('stakingPoolInfos');

  if (!stakingPoolInfos) {
    await fetchPoolInfo(redis);
  }
};

const saveValidatorLists = async (redis: Redis) => {
  const mappedValidators = (await redis.parse(
    'mappedValidators',
  )) as ValidatorEpochData[];

  if (mappedValidators.length > 0) {
    const stakingPoolStakeProposalsFromContract = (await redis.parse(
      'stakingPoolStakeProposalsFromContract',
    )) as CachedTimestampMap<string>;

    const stakingPoolMetadataInfo = await redis.parse(
      'stakingPoolMetadataInfo',
    );

    let stakingPoolStakeProposals = new Map();

    if (
      stakingPoolStakeProposalsFromContract &&
      Array.isArray(stakingPoolStakeProposalsFromContract)
    ) {
      stakingPoolStakeProposals = new Map(
        stakingPoolStakeProposalsFromContract,
      );
    }

    const stakingPoolInfos = (await redis.parse(
      'stakingPoolInfos',
    )) as CachedTimestampMap<ValidatorPoolInfo>;

    let stakingPoolInfosData = new Map();

    if (stakingPoolInfos && Array.isArray(stakingPoolInfos)) {
      stakingPoolInfosData = new Map(stakingPoolInfos);
    }

    const combined = mappedValidators.map((validator, index: number) => {
      const metaInfo = stakingPoolMetadataInfo
        ? stakingPoolMetadataInfo.find(
            (item: { [key: string]: PoolMetadataAccountInfo }) =>
              validator.accountId in item,
          )
        : null;

      return {
        ...validator,
        contractStake: stakingPoolStakeProposals.has(validator.accountId)
          ? stakingPoolStakeProposals?.get(validator.accountId)
          : null,
        description: metaInfo ? Object.values(metaInfo)[0] : null,
        index,

        poolInfo: stakingPoolInfosData.has(validator.accountId)
          ? stakingPoolInfosData.get(validator.accountId)
          : null,
      };
    });

    await redis.stringify('validatorLists', combined, DAY);
  }
};

export const validatorsCheck = async (redis: Redis) => {
  const validators = (await getValidators(redis)) as EpochValidatorInfo;

  if (validators) {
    const poolIds = await redis.parse('poolIds');
    const genesisConfig = await redis.parse('genesisConfig');
    const protocolConfig = await redis.parse('protocolConfig');

    const mappedValidators = mapValidators(validators, poolIds ?? []);

    await redis.stringify('mappedValidators', mappedValidators, DAY);

    await redis.stringify(
      'currentValidators',
      validators.current_validators,
      DAY,
    );

    await redis.stringify('nextValidators', validators.next_validators, DAY);

    if (genesisConfig && protocolConfig) {
      const seatPrice = await validatorApi.findSeatPrice(
        validators.current_validators,
        protocolConfig.maxNumberOfSeats,
        genesisConfig.minStakeRatio,
        protocolConfig.version,
      );
      await redis.stringify('epochStatsCheck', seatPrice.toString(), DAY);
    }

    const { data } = await RPC.query(
      { block_id: validators.epoch_start_height },
      'block',
    );

    const epochStartBlocks = data.result as BlockResult;

    if (epochStartBlocks) {
      await redis.stringify(
        'epochStartBlock',
        {
          height: epochStartBlocks.header.height,
          timestamp: epochStartBlocks.header.timestamp,
          total_supply: epochStartBlocks.header.total_supply,
        },
        DAY,
      );
    }

    await Promise.all([
      Promise.race([
        fetchStakingPoolInfo(redis),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 25000),
        ),
      ]),
      Promise.race([
        fetchPoolInfo(redis),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 25000),
        ),
      ]),
    ]);

    await saveValidatorLists(redis);
  }
};

export const stakingPoolMetadataInfoCheck = async (redis: Redis) => {
  const VALIDATOR_DESCRIPTION_QUERY_AMOUNT = 100;
  let currentIndex = 0;
  const stakingPoolsDescriptions = [];

  const { data } = await RPC.callFunction(
    'pool-details.near',
    'get_all_fields',
    RPC.encodeArgs({
      from_index: currentIndex,
      limit: VALIDATOR_DESCRIPTION_QUERY_AMOUNT,
    }),
  );

  if (data.result) {
    const metadataInfo = JSON.parse(Buffer.from(data.result.result).toString());
    const entries: [string, PoolMetadataAccountInfo][] =
      Object.entries(metadataInfo);

    if (entries.length > 0) {
      for (const [accountId, poolMetadataInfo] of entries) {
        const entryObject: { [accountId: string]: PoolMetadataAccountInfo } = {
          [accountId]: poolMetadataInfo,
        };
        stakingPoolsDescriptions.push(entryObject);
      }

      currentIndex += VALIDATOR_DESCRIPTION_QUERY_AMOUNT;
    }
  }

  await redis.stringify(
    'stakingPoolMetadataInfo',
    stakingPoolsDescriptions,
    DAY,
  );
};

export const validatorsTelemetryCheck = async (redis: Redis) => {
  const validators = (await redis.parse(
    'validatorsPromise',
  )) as EpochValidatorInfo;

  if (validators) {
    const poolIds = await redis.parse('poolIds');

    const accountIds = [
      ...validators.current_validators.map(({ account_id }) => account_id),
      ...validators.next_validators.map(({ account_id }) => account_id),
      ...validators.current_proposals.map(({ account_id }) => account_id),
      ...(poolIds ?? []),
    ];
    const nodesInfo = await db('nodes')
      .select(
        'ip_address',
        'account_id',
        'node_id',
        'last_seen',
        'last_height',
        'status',
        'agent_name',
        'agent_version',
        'agent_build',
        'latitude',
        'longitude',
        'city',
      )
      .whereIn('account_id', accountIds)
      .orderBy('last_seen');

    const nodes = nodesInfo.reduce<Partial<Record<string, ValidatorTelemetry>>>(
      (acc, nodeInfo) => {
        acc[nodeInfo.account_id] = {
          agentBuild: nodeInfo.agent_build,
          agentName: nodeInfo.agent_name,
          agentVersion: nodeInfo.agent_version,
          city: nodeInfo.city,
          ipAddress: nodeInfo.ip_address,
          lastHeight: parseInt(nodeInfo.last_height, 10),
          lastSeen: nodeInfo.last_seen.valueOf(),
          latitude: nodeInfo.latitude,
          longitude: nodeInfo.longitude,
          nodeId: nodeInfo.node_id,
          status: nodeInfo.status,
        };
        return acc;
      },
      {},
    );

    await redis.stringify('validatorTelemetry', nodes, DAY);
  }
};
