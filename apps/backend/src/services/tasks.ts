import { logger } from 'nb-logger';
import {
  AccountView,
  BlockResult,
  EpochValidatorInfo,
  validatorApi,
} from 'nb-near';
import {
  ProtocolConfig,
  ValidatorEpochData,
  ValidatorPoolInfo,
  ValidatorTelemetry,
} from 'nb-types';

import config from '#config';
import db from '#libs/knex';
import RPC, { archivalRPC } from '#libs/near';
import { validator } from '#libs/utils';
import {
  CachedTimestampMap,
  ExpGenesisConfig,
  ExpProtocolConfig,
  GenesisConfig,
  PoolMetadataAccountInfo,
} from '#types/types';

export const EMPTY_CODE_HASH = '11111111111111111111111111111111';

export const latestBlockCheck = async () => {
  const { data } = await RPC.query({ finality: 'final' }, 'block');

  if (data.result) {
    const latestBlock = data.result as BlockResult;
    await db('validator_data').update(
      'latest_block',
      JSON.stringify({
        height: latestBlock?.header?.height,
        timestamp: latestBlock?.header?.timestamp,
      }),
    );
  }
};

export const protocolConfigCheck = async () => {
  const { data } = await RPC.query(
    { finality: 'final' },
    'EXPERIMENTAL_protocol_config',
  );

  if (data.result) {
    const protocolConfig = data.result as ExpProtocolConfig;

    if (protocolConfig) {
      await db('validator_data').update(
        'protocol_config',
        JSON.stringify({
          epochLength: protocolConfig.epoch_length,
          maxNumberOfSeats:
            protocolConfig.num_block_producer_seats +
            protocolConfig.avg_hidden_validator_seats_per_shard.reduce(
              (seats, seat) => seats + seat,
              0,
            ),
          version: protocolConfig.protocol_version,
        }),
      );
    }
  }
};

export const genesisProtocolInfoFetch = async () => {
  const [{ data }, genesisAccount] = await Promise.all([
    RPC.query({ finality: 'final' }, 'EXPERIMENTAL_genesis_config'),
    db('accounts').count('account_id').whereNull('created_by_receipt_id'),
  ]);

  if (data.result && genesisAccount) {
    const genesisAccountCount = genesisAccount[0].count;
    const genesisProtocolConfig = data.result as ExpGenesisConfig;

    await db('validator_data').update(
      'genesis_config',
      JSON.stringify({
        accountCount: genesisAccountCount,
        height: genesisProtocolConfig.genesis_height,
        minStakeRatio: genesisProtocolConfig.minimum_stake_ratio,
        protocolVersion: genesisProtocolConfig.protocol_version,
        timestamp: new Date(genesisProtocolConfig.genesis_time).valueOf(),
        totalSupply: genesisProtocolConfig.total_supply,
      }),
    );
  }
};

export const poolIdsCheck = async () => {
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

  await db('validator_data').update('pool_ids', JSON.stringify(accounts));
};

const getValidators = async () => {
  const { data } = await RPC.query([null], 'validators');

  if (data.result) {
    const validator = data.result as EpochValidatorInfo;
    await db('validator_data').update(
      'validators_promise',
      JSON.stringify(validator),
    );

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
  const data = await db('validator_data')
    .select('mapped_validators', 'stake_proposals')
    .first();
  const validators = data?.mapped_validators as unknown as ValidatorEpochData[];

  const existingStakeProposals =
    data?.stake_proposals as unknown as CachedTimestampMap<string>;
  let existingProposalsMap = new Map<string, string>();

  if (existingStakeProposals && Array.isArray(existingStakeProposals)) {
    existingProposalsMap = new Map(existingStakeProposals);
  }

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
        const previousValue = existingProposalsMap.get(id);

        if (previousValue) {
          mappings.valueMap.set(id, previousValue);
        }

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

      await db('validator_data').update(
        'stake_proposals',
        JSON.stringify(Array.from(mappingsnew.valueMap.entries())),
      );
      await saveValidatorLists();
    }
  }
};

export const updateStakingPoolStake = async () => {
  const data = await db('validator_data').select('stake_proposals').first();
  const stakeProposals = data?.stake_proposals;

  if (!stakeProposals) {
    await fetchStakingPoolInfo();
  }
};

const fetchPoolInfo = async () => {
  const data = await db('validator_data')
    .select('mapped_validators', 'staking_pool_infos')
    .first();
  const validators = data?.mapped_validators as unknown as ValidatorEpochData[];

  const existingStakingPoolInfos =
    data?.staking_pool_infos as unknown as CachedTimestampMap<ValidatorPoolInfo>;
  let existingInfosMap = new Map<string, ValidatorPoolInfo>();

  if (existingStakingPoolInfos && Array.isArray(existingStakingPoolInfos)) {
    existingInfosMap = new Map(existingStakingPoolInfos);
  }

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
        logger.warn({ account: id, error: e, failed: true });
        const previousValue = existingInfosMap.get(id);

        if (previousValue) {
          mappings.valueMap.set(id, previousValue);
        }

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
      await db('validator_data').update(
        'staking_pool_infos',
        JSON.stringify(Array.from(mappingsnew.valueMap.entries())),
      );
      await saveValidatorLists();
    }
  }
};

export const updatePoolInfoMap = async () => {
  const data = await db('validator_data').select('staking_pool_infos').first();
  const stakingPoolInfos = data?.staking_pool_infos;

  if (!stakingPoolInfos) {
    await fetchPoolInfo();
  }
};

const saveValidatorLists = async () => {
  const data = await db('validator_data').select('*').first();
  const mappedValidators =
    data?.mapped_validators as unknown as ValidatorEpochData[];

  if (mappedValidators.length > 0) {
    const stakeProposals =
      data?.stake_proposals as unknown as CachedTimestampMap<string>;

    const stakingPoolMetadata = data?.staking_pool_metadata as unknown as {
      [key: string]: PoolMetadataAccountInfo;
    }[];

    let stakingPoolStakeProposals = new Map();

    if (stakeProposals && Array.isArray(stakeProposals)) {
      stakingPoolStakeProposals = new Map(stakeProposals);
    }

    const stakingPoolInfos =
      data?.staking_pool_infos as unknown as CachedTimestampMap<ValidatorPoolInfo>;

    let stakingPoolInfosData = new Map();

    if (stakingPoolInfos && Array.isArray(stakingPoolInfos)) {
      stakingPoolInfosData = new Map(stakingPoolInfos);
    }

    const combined = mappedValidators.map((validator, index: number) => {
      const metaInfo = stakingPoolMetadata
        ? stakingPoolMetadata.find((item) => validator.accountId in item)
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

    await db('validator_data').update(
      'validator_lists',
      JSON.stringify(combined),
    );
  }
};

export const validatorsCheck = async () => {
  const validators = (await getValidators()) as EpochValidatorInfo;

  if (validators) {
    const datas = await db('validator_data').select('*').first();
    const poolIds = datas?.pool_ids as unknown as string[];
    const genesisConfig = datas?.genesis_config as unknown as GenesisConfig;
    const protocolConfig = datas?.protocol_config as unknown as ProtocolConfig;

    const mappedValidators = mapValidators(validators, poolIds ?? []);

    await db('validator_data').update(
      'mapped_validators',
      JSON.stringify(mappedValidators),
    );
    await db('validator_data').update(
      'current_validators',
      JSON.stringify(validators.current_validators),
    );

    if (genesisConfig && protocolConfig) {
      const seatPrice = validatorApi.findSeatPrice(
        validators.current_validators,
        protocolConfig.maxNumberOfSeats,
        genesisConfig.minStakeRatio,
        protocolConfig.version,
      );
      await db('validator_data').update(
        'epoch_stats_check',
        JSON.stringify(seatPrice.toString()),
      );
    }

    const { data } = await archivalRPC.query(
      { block_id: validators.epoch_start_height },
      'block',
    );

    const epochStartBlocks = data.result as BlockResult;

    if (epochStartBlocks) {
      await db('validator_data').update(
        'epoch_start_block',
        JSON.stringify({
          height: epochStartBlocks.header.height,
          timestamp: epochStartBlocks.header.timestamp,
          total_supply: epochStartBlocks.header.total_supply,
        }),
      );
    }

    await Promise.all([fetchStakingPoolInfo(), fetchPoolInfo()]);

    await saveValidatorLists();
  }
};

export const stakingPoolMetadataCheck = async () => {
  const VALIDATOR_DESCRIPTION_QUERY_AMOUNT = 100;
  let currentIndex = 0;
  const stakingPoolsDescriptions = [];
  let hasMoreData = true;

  while (hasMoreData) {
    const { data } = await RPC.callFunction(
      'pool-details.near',
      'get_all_fields',
      RPC.encodeArgs({
        from_index: currentIndex,
        limit: VALIDATOR_DESCRIPTION_QUERY_AMOUNT,
      }),
    );

    if (data.result) {
      const metadataInfo = JSON.parse(
        Buffer.from(data.result.result).toString(),
      );
      const entries: [string, PoolMetadataAccountInfo][] =
        Object.entries(metadataInfo);

      if (entries.length > 0) {
        for (const [accountId, poolMetadataInfo] of entries) {
          const entryObject: { [accountId: string]: PoolMetadataAccountInfo } =
            {
              [accountId]: poolMetadataInfo,
            };
          stakingPoolsDescriptions.push(entryObject);
        }

        currentIndex += entries.length;
      } else {
        hasMoreData = false;
      }
    } else {
      hasMoreData = false;
    }
  }

  await db('validator_data').update(
    'staking_pool_metadata',
    JSON.stringify(stakingPoolsDescriptions),
  );
};

export const validatorsTelemetryCheck = async () => {
  const data = await db('validator_data').select('*').first();
  const validators = data?.mapped_validators as unknown as EpochValidatorInfo;

  if (validators) {
    const poolIds = data?.pool_ids as unknown as string[];
    const currentValidators = validators.current_validators ?? [];
    const nextValidators = validators.next_validators ?? [];
    const currentProposals = validators.current_proposals ?? [];

    const accountIds = [
      ...currentValidators.map(({ account_id }) => account_id),
      ...nextValidators.map(({ account_id }) => account_id),
      ...currentProposals.map(({ account_id }) => account_id),
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

    await db('validator_data').update(
      'validator_telemetry',
      JSON.stringify(nodes),
    );
  }
};
