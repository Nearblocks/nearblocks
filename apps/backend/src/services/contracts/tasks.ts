import Big from 'big.js';

import { AccountView, BlockResult, EpochValidatorInfo } from 'nb-near';
import { RPC as NearRPC } from 'nb-near';
import {
  ValidatorConfig,
  ValidatorDescription,
  ValidatorEpochData,
  ValidatorEpochRecord,
} from 'nb-types';
import { yoctoToNear } from 'nb-utils';

import config from '#config';
import { dbBase } from '#libs/knex';

type ExpGenesisConfig = {
  genesis_height: number;
  genesis_time: string;
  minimum_stake_ratio: number[];
  protocol_version: number;
  total_supply: string;
};

type ExpProtocolConfig = {
  avg_hidden_validator_seats_per_shard?: number[];
  epoch_length: number;
  max_inflation_rate: number[];
  num_block_producer_seats: number;
  protocol_reward_rate: number[];
  protocol_version: number;
};

const RPC = new NearRPC(config.rpcUrl);
export const EMPTY_CODE_HASH = '11111111111111111111111111111111';

export const validator = {
  stakingPool: {
    mainnet: 'poolv1.near',
    testnet: undefined,
  },
};

const CHUNK_SIZE = 100;
const DEFAULT_MIN_STAKE_RATIO = [1, 6250];

const findSeatPrice = (
  validatorList: { stake: string }[],
  minimumStakeRatio: number[],
): string => {
  const [ratioNum, ratioDen] = minimumStakeRatio;
  const stakesSum = validatorList.reduce((sum, v) => sum + BigInt(v.stake), 0n);

  return ((stakesSum * BigInt(ratioNum)) / BigInt(ratioDen)).toString();
};

export const latestBlockCheck = async () => {
  const latestBlock = await dbBase('blocks')
    .orderBy('block_height', 'desc')
    .first();

  if (latestBlock) {
    await dbBase('validator_config')
      .insert({
        id: 1,
        latest_block_height: latestBlock.block_height,
        latest_block_timestamp: +latestBlock.block_timestamp,
        updated_at: new Date(),
      })
      .onConflict('id')
      .merge(['latest_block_height', 'latest_block_timestamp', 'updated_at']);
  }
};

export const protocolConfigCheck = async () => {
  const { data } = await RPC.query(
    { finality: 'final' },
    'EXPERIMENTAL_protocol_config',
  );

  if (data.result) {
    const protocolConfig = data.result as ExpProtocolConfig;

    await dbBase('validator_config')
      .insert({
        id: 1,
        protocol_epoch_length: protocolConfig.epoch_length,
        protocol_max_inflation_rate: protocolConfig.max_inflation_rate
          ? (JSON.stringify(
              protocolConfig.max_inflation_rate,
            ) as unknown as number[])
          : null,
        protocol_max_seats:
          protocolConfig.num_block_producer_seats +
          (protocolConfig.avg_hidden_validator_seats_per_shard?.reduce(
            (seats, seat) => seats + seat,
            0,
          ) ?? 0),
        protocol_treasury_fraction: protocolConfig.protocol_reward_rate
          ? (JSON.stringify(
              protocolConfig.protocol_reward_rate,
            ) as unknown as number[])
          : null,
        protocol_version: protocolConfig.protocol_version,
        updated_at: new Date(),
      })
      .onConflict('id')
      .merge([
        'protocol_epoch_length',
        'protocol_max_inflation_rate',
        'protocol_max_seats',
        'protocol_treasury_fraction',
        'protocol_version',
        'updated_at',
      ]);
  }
};

export const genesisProtocolInfoFetch = async () => {
  const [{ data }, genesisAccount] = await Promise.all([
    RPC.query({ finality: 'final' }, 'EXPERIMENTAL_genesis_config'),
    dbBase('accounts').count('account_id').whereNull('created_by_receipt_id'),
  ]);

  if (data.result) {
    const genesisAccountCount = String(genesisAccount[0].count);
    const genesisProtocolConfig = data.result as ExpGenesisConfig;

    await dbBase('validator_config')
      .insert({
        genesis_account_count: genesisAccountCount,
        genesis_height: genesisProtocolConfig.genesis_height,
        genesis_min_stake_ratio: JSON.stringify(
          genesisProtocolConfig.minimum_stake_ratio,
        ) as unknown as number[],
        genesis_protocol_version: genesisProtocolConfig.protocol_version,
        genesis_timestamp: new Date(
          genesisProtocolConfig.genesis_time,
        ).valueOf(),
        genesis_total_supply: genesisProtocolConfig.total_supply,
        id: 1,
        updated_at: new Date(),
      })
      .onConflict('id')
      .merge([
        'genesis_account_count',
        'genesis_height',
        'genesis_min_stake_ratio',
        'genesis_protocol_version',
        'genesis_timestamp',
        'genesis_total_supply',
        'updated_at',
      ]);
  }
};

export const poolIdsCheck = async () => {
  const network = config.network;
  const address =
    network === 'mainnet'
      ? validator.stakingPool.mainnet
      : validator.stakingPool.testnet;

  if (!address) return;

  const rows = await dbBase('accounts')
    .select('account_id')
    .where('parent', address);

  const accounts = rows.map((row) => ({ account_id: row.account_id }));

  for (let i = 0; i < accounts.length; i += CHUNK_SIZE) {
    await dbBase('validator_epoch_data')
      .insert(accounts.slice(i, i + CHUNK_SIZE))
      .onConflict('account_id')
      .ignore();
  }
};

const getValidators = async () => {
  const { data } = await RPC.query([null], 'validators');

  if (data.result) {
    return data.result as EpochValidatorInfo;
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
    const v = validatorsMap.get(nextValidator.account_id) || {
      accountId: nextValidator.account_id,
      publicKey: nextValidator.public_key,
    };
    v.nextEpoch = { stake: nextValidator.stake };
    validatorsMap.set(nextValidator.account_id, v);
  }

  for (const nextProposal of epochStatus.current_proposals) {
    const v = validatorsMap.get(nextProposal.account_id) || {
      accountId: nextProposal.account_id,
      publicKey: nextProposal.public_key,
    };
    v.afterNextEpoch = { stake: nextProposal.stake };
    validatorsMap.set(nextProposal.account_id, v);
  }

  for (const accountId of poolIds) {
    const v = validatorsMap.get(accountId) || { accountId };
    validatorsMap.set(accountId, v);
  }

  return [...validatorsMap.values()];
};

const fetchStakingPoolInfo = async () => {
  const validators = (await dbBase('validator_epoch_data')
    .select('account_id')
    .whereNull('current_epoch_stake')) as Pick<
    ValidatorEpochRecord,
    'account_id'
  >[];

  if (validators.length === 0) return;

  await Promise.all(
    validators.map(async ({ account_id }) => {
      try {
        const { data } = await RPC.callFunction(
          account_id,
          'get_total_staked_balance',
          RPC.encodeArgs({}),
        );

        if (data.result) {
          const stake = JSON.parse(Buffer.from(data.result.result).toString());
          await dbBase('validator_epoch_data')
            .where('account_id', account_id)
            .update({ contract_stake: stake, updated_at: new Date() });
        }
      } catch (e) {
        // ignore RPC errors for individual validators
      }
    }),
  );
};

export const updateStakingPoolStake = async () => {
  const row = await dbBase('validator_epoch_data')
    .whereNotNull('contract_stake')
    .first();

  if (!row) {
    await fetchStakingPoolInfo();
  }
};

const fetchPoolInfo = async () => {
  const validators = (await dbBase('validator_epoch_data').select(
    'account_id',
  )) as Pick<ValidatorEpochRecord, 'account_id'>[];

  if (validators.length === 0) return;

  await Promise.all(
    validators.map(async ({ account_id }) => {
      try {
        const { data } = await RPC.query(
          {
            account_id,
            finality: 'final',
            request_type: 'view_account',
          },
          'query',
        );

        const account = data.result as AccountView;

        if (account.code_hash !== EMPTY_CODE_HASH) {
          const { data: countData } = await RPC.callFunction(
            account_id,
            'get_number_of_accounts',
            RPC.encodeArgs({}),
          );
          const delegatorsCount = RPC.decodeResult(
            countData.result.result,
          ) as number;

          const { data: feeData } = await RPC.callFunction(
            account_id,
            'get_reward_fee_fraction',
            RPC.encodeArgs({}),
          );
          const fee = RPC.decodeResult(feeData.result.result) as {
            denominator: number;
            numerator: number;
          };

          await dbBase('validator_epoch_data')
            .where('account_id', account_id)
            .update({
              delegators_count: delegatorsCount,
              fee_denominator: fee.denominator,
              fee_numerator: fee.numerator,
              updated_at: new Date(),
            });
        }
      } catch (e) {
        // ignore RPC errors for individual validators
      }
    }),
  );
};

export const updatePoolInfoMap = async () => {
  const row = await dbBase('validator_epoch_data')
    .whereNotNull('delegators_count')
    .first();

  if (!row) {
    await fetchPoolInfo();
  }
};

export const validatorsCheck = async () => {
  const validators = await getValidators();

  if (validators) {
    const [poolRows, configData] = (await Promise.all([
      dbBase('validator_epoch_data').select('account_id'),
      dbBase('validator_config').where('id', 1).first(),
    ])) as [
      Pick<ValidatorEpochRecord, 'account_id'>[],
      undefined | ValidatorConfig,
    ];

    const poolIds = poolRows.map((r) => r.account_id);

    const mappedValidators = mapValidators(validators, poolIds);

    const epochRows = mappedValidators.map((v) => ({
      account_id: v.accountId,
      after_next_epoch_stake: v.afterNextEpoch?.stake ?? null,
      current_epoch_blocks_expected:
        v.currentEpoch?.progress.blocks.total ?? null,
      current_epoch_blocks_produced:
        v.currentEpoch?.progress.blocks.produced ?? null,
      current_epoch_chunks_expected:
        v.currentEpoch?.progress.chunks.total ?? null,
      current_epoch_chunks_produced:
        v.currentEpoch?.progress.chunks.produced ?? null,
      current_epoch_stake: v.currentEpoch?.stake ?? null,
      next_epoch_stake: v.nextEpoch?.stake ?? null,
      public_key: v.publicKey ?? null,
      updated_at: new Date(),
    }));

    for (let i = 0; i < epochRows.length; i += CHUNK_SIZE) {
      await dbBase('validator_epoch_data')
        .insert(epochRows.slice(i, i + CHUNK_SIZE))
        .onConflict('account_id')
        .merge([
          'public_key',
          'current_epoch_stake',
          'current_epoch_blocks_produced',
          'current_epoch_blocks_expected',
          'current_epoch_chunks_produced',
          'current_epoch_chunks_expected',
          'next_epoch_stake',
          'after_next_epoch_stake',
          'updated_at',
        ]);
    }

    const currentAccountIds = mappedValidators.map((v) => v.accountId);
    await dbBase('validator_epoch_data')
      .whereNotIn('account_id', currentAccountIds)
      .delete();

    const minStakeRatio =
      configData?.genesis_min_stake_ratio ?? DEFAULT_MIN_STAKE_RATIO;

    const seatPrice =
      validators.current_validators.length > 0
        ? findSeatPrice(validators.current_validators, minStakeRatio)
        : null;
    const nextSeatPrice =
      validators.next_validators.length > 0
        ? findSeatPrice(validators.next_validators, minStakeRatio)
        : null;

    await dbBase('validator_config').where('id', 1).update({
      epoch_seat_price: seatPrice,
      next_epoch_seat_price: nextSeatPrice,
      updated_at: new Date(),
    });

    const { data } = await RPC.query(
      { block_id: validators.epoch_start_height },
      'block',
    );

    const epochStartBlocks = data.result as BlockResult;

    if (epochStartBlocks) {
      await dbBase('validator_config').where('id', 1).update({
        epoch_start_height: epochStartBlocks.header.height,
        epoch_start_timestamp: epochStartBlocks.header.timestamp,
        epoch_start_total_supply: epochStartBlocks.header.total_supply,
        updated_at: new Date(),
      });
    }

    const isNewEpoch =
      !configData?.epoch_start_height ||
      configData.epoch_start_height !== validators.epoch_start_height;

    if (isNewEpoch) {
      await Promise.all([fetchStakingPoolInfo(), fetchPoolInfo()]);
      await computeValidatorStats();
    }
  }
};

export const stakingPoolMetadataCheck = async () => {
  const VALIDATOR_DESCRIPTION_QUERY_AMOUNT = 100;
  let currentIndex = 0;
  const rows: Array<
    { account_id: string; updated_at: Date } & ValidatorDescription
  > = [];
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
      const entries: [string, ValidatorDescription][] =
        Object.entries(metadataInfo);

      if (entries.length > 0) {
        for (const [accountId, info] of entries) {
          rows.push({
            account_id: accountId,
            city: info.city,
            country: info.country,
            country_code: info.country_code,
            description: info.description,
            discord: info.discord,
            email: info.email,
            github: info.github,
            logo: info.logo,
            name: info.name,
            telegram: info.telegram,
            twitter: info.twitter,
            updated_at: new Date(),
            url: info.url,
          });
        }
        currentIndex += entries.length;
      } else {
        hasMoreData = false;
      }
    } else {
      hasMoreData = false;
    }
  }

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    await dbBase('validator_pool_metadata')
      .insert(rows.slice(i, i + CHUNK_SIZE))
      .onConflict('account_id')
      .merge();
  }
};

const FRACTION_DIGITS = 2;
const EXTRA_PRECISION_MULTIPLIER = 10000;
const NETWORK_HOLDER_SHARE_PERCENT = 33;

const computeStakingStatus = (
  row: ValidatorEpochRecord,
  seatPrice: null | string,
): null | string => {
  if (row.current_epoch_stake !== null)
    return row.next_epoch_stake !== null ? 'active' : 'leaving';
  if (row.next_epoch_stake !== null) return 'joining';
  if (row.after_next_epoch_stake !== null) return 'proposal';
  if (!seatPrice || !row.contract_stake) return null;

  const contractStake = Big(row.contract_stake);
  const seatPriceBN = Big(seatPrice);

  if (contractStake.gte(seatPriceBN)) return 'onHold';
  if (contractStake.gte(seatPriceBN.times(Big(20)).div(Big(100))))
    return 'newcomer';

  return 'idle';
};

const computeStakeChange = (
  row: ValidatorEpochRecord,
): { symbol: string; value: string } | null => {
  const nextVisibleStake = row.next_epoch_stake ?? row.after_next_epoch_stake;

  if (!row.current_epoch_stake || !nextVisibleStake) return null;

  const delta = Big(nextVisibleStake).minus(Big(row.current_epoch_stake));
  if (delta.eq(Big(0))) return null;

  const amount = Number(yoctoToNear(delta.abs().toFixed(0)));
  const symbol = delta.gte(Big(0)) ? '+' : '-';
  const value =
    amount < 1 ? Big(amount).abs().toFixed(4) : Big(amount).abs().toFixed(0);

  return { symbol, value };
};

export const computeValidatorStats = async () => {
  const validators = (await dbBase('validator_epoch_data').select(
    'account_id',
    'current_epoch_stake',
    'next_epoch_stake',
    'after_next_epoch_stake',
    'contract_stake',
  )) as ValidatorEpochRecord[];

  if (validators.length === 0) return;

  const configData = (await dbBase('validator_config')
    .where('id', 1)
    .first()) as undefined | ValidatorConfig;

  const seatPrice = configData?.epoch_seat_price ?? null;

  const totalStake = validators.reduce((acc, v) => {
    return v.current_epoch_stake ? acc.plus(Big(v.current_epoch_stake)) : acc;
  }, Big(0));

  if (totalStake.eq(Big(0))) return;

  const sorted = [...validators].sort((a, b) => {
    const stakeA = a.current_epoch_stake ? Big(a.current_epoch_stake) : Big(0);
    const stakeB = b.current_epoch_stake ? Big(b.current_epoch_stake) : Big(0);
    return stakeB.cmp(stakeA);
  });

  const extra = Big(EXTRA_PRECISION_MULTIPLIER);
  const holderLimit = totalStake
    .times(NETWORK_HOLDER_SHARE_PERCENT)
    .div(Big(100));

  let networkHolderIndex = -1;
  let cumulativeAmount = Big(0);

  const updates: Array<{
    account_id: string;
    accumulated_stake_percent: null | string;
    cumulative_stake_percent: null | string;
    is_network_holder_warning: boolean;
    own_stake_percent: null | string;
    stake_change_symbol: null | string;
    stake_change_value: null | string;
    staking_status: null | string;
    updated_at: Date;
  }> = sorted.map((v, i) => {
    const stake = v.current_epoch_stake ? Big(v.current_epoch_stake) : Big(0);
    const prevCumulative = cumulativeAmount;

    cumulativeAmount = v.current_epoch_stake
      ? cumulativeAmount.plus(stake)
      : cumulativeAmount;

    const ownPercent = v.current_epoch_stake
      ? stake.times(extra).div(totalStake)
      : null;
    const cumulativePercent = v.current_epoch_stake
      ? cumulativeAmount.times(extra).div(totalStake)
      : null;
    const accumulatedPercent = v.current_epoch_stake
      ? prevCumulative.times(extra).div(totalStake)
      : null;

    const isHolder =
      networkHolderIndex === -1 &&
      v.current_epoch_stake !== null &&
      cumulativeAmount.gt(holderLimit);

    if (isHolder) networkHolderIndex = i;

    const stakeChange = computeStakeChange(v);
    const stakingStatus = computeStakingStatus(v, seatPrice);

    return {
      account_id: v.account_id,
      accumulated_stake_percent: accumulatedPercent
        ? accumulatedPercent.div(extra).times(Big(100)).toFixed(FRACTION_DIGITS)
        : null,
      cumulative_stake_percent: cumulativePercent
        ? cumulativePercent.div(extra).times(Big(100)).toFixed(FRACTION_DIGITS)
        : null,
      is_network_holder_warning: isHolder,
      own_stake_percent: ownPercent
        ? ownPercent.div(extra).times(Big(100)).toFixed(FRACTION_DIGITS)
        : null,
      stake_change_symbol: stakeChange?.symbol ?? null,
      stake_change_value: stakeChange?.value ?? null,
      staking_status: stakingStatus,
      updated_at: new Date(),
    };
  });

  for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
    await Promise.all(
      updates
        .slice(i, i + CHUNK_SIZE)
        .map(({ account_id, ...fields }) =>
          dbBase('validator_epoch_data')
            .where('account_id', account_id)
            .update(fields),
        ),
    );
  }

  await dbBase('validator_config')
    .where('id', 1)
    .update({
      network_holder_index: networkHolderIndex >= 0 ? networkHolderIndex : null,
      total_stake: totalStake.toFixed(0),
      updated_at: new Date(),
    });
};

export const apyCheck = async () => {
  const configData = (await dbBase('validator_config')
    .where('id', 1)
    .first()) as undefined | ValidatorConfig;

  if (
    !configData?.protocol_max_inflation_rate ||
    !configData?.protocol_treasury_fraction ||
    !configData?.total_stake
  )
    return;

  const [infNum, infDen] = configData.protocol_max_inflation_rate;
  const maxInflationRate = infNum / infDen;

  const [trNum, trDen] = configData.protocol_treasury_fraction;
  const treasuryFraction = trNum / trDen;

  const { data: blockData } = await RPC.query({ finality: 'final' }, 'block');
  if (!blockData.result) return;

  const block = blockData.result as BlockResult;

  const [prevEpochData, epochData] = await Promise.all([
    RPC.query({ block_id: block.header.epoch_id }, 'block'),
    RPC.query({ block_id: block.header.next_epoch_id }, 'block'),
  ]);

  const prevEpoch = prevEpochData.data.result as BlockResult;
  const epoch = epochData.data.result as BlockResult;

  if (!prevEpoch || !epoch) return;

  const epochLengthSeconds =
    Big(epoch.header.timestamp_nanosec)
      .minus(prevEpoch.header.timestamp_nanosec)
      .toNumber() / 1e9;

  if (epochLengthSeconds <= 0) return;

  const epochsPerYear = 31536000 / epochLengthSeconds;
  const totalStake = Big(configData.total_stake);

  const apy = Big(block.header.total_supply)
    .times(Math.pow(1 + maxInflationRate, 1 / epochsPerYear) - 1)
    .times(epochsPerYear)
    .div(totalStake)
    .times(1 - treasuryFraction)
    .times(100)
    .toNumber()
    .toFixed(2);

  await dbBase('validator_config').where('id', 1).update({
    last_epoch_apy: apy,
    updated_at: new Date(),
  });
};
