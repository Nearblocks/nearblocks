import { Response } from 'express';

import { BlockHeader } from 'nb-near';
import type { Validator, ValidatorInfo } from 'nb-schemas';
import { LatestBlock, ProtocolConfig } from 'nb-types';

import catchAsync from '#libs/async';
import { dbBase } from '#libs/pgp';
import { List } from '#libs/schema/validators';
import { elapsedTime, epochProgress, timeRemaining } from '#libs/validators';
import sql from '#sql/validators';
import { RequestValidator } from '#types/types';

// v1 validators served by reusing the shared v3 validator queries
// (#sql/validators) against the split DBs and re-nesting/re-casing the flat v3
// rows back into the legacy camelCase v1 shape. The orchestration mirrors
// services/v3/validators (list + info), except that the v1 response has no
// cursor field, so the page slice is done in memory the way the legacy handler
// did it. No v3 service file is imported or modified.

// Legacy shape emitted when there is no validator data at all.
const EMPTY = {
  currentValidators: 0,
  elapsedTimeData: 0,
  epochProgressData: 0,
  epochStatsCheck: 0,
  lastEpochApy: 0,
  latestBlock: {},
  total: 0,
  totalSeconds: 0,
  totalStake: 0,
  validatorFullData: [],
  validatorTelemetry: [],
};

const NETWORK_HOLDER_WARNING = (index: number) =>
  `Validators 1 - ${index} hold a cumulative stake above 33%. Delegating to the validators below improves the decentralization of the network.`;

/**
 * v3 keeps the pool metadata flat on the validator row; v1 nested it under
 * `description`. Validators without a metadata row get `null` (legacy omitted
 * the key entirely in that case).
 */
const description = (validator: Validator) => {
  const fields = {
    city: validator.city,
    country: validator.country,
    country_code: validator.country_code,
    description: validator.description,
    discord: validator.discord,
    email: validator.email,
    github: validator.github,
    logo: validator.logo,
    name: validator.name,
    telegram: validator.telegram,
    twitter: validator.twitter,
    url: validator.url,
  };

  return Object.values(fields).some((value) => value !== null) ? fields : null;
};

const validatorData = (validator: Validator, holderIndex: null | number) => {
  const current = validator.current_epoch_stake;

  return {
    accountId: validator.account_id,
    afterNextEpoch: validator.after_next_epoch_stake
      ? { stake: validator.after_next_epoch_stake }
      : undefined,
    contractStake: validator.contract_stake ?? undefined,
    cumulativeStake: current
      ? {
          accumulatedPercent: validator.accumulated_stake_percent,
          cumulativePercent: validator.cumulative_stake_percent,
          ownPercentage: validator.own_stake_percent,
        }
      : null,
    currentEpoch: current
      ? {
          progress: {
            blocks: {
              produced: validator.current_epoch_blocks_produced ?? 0,
              total: validator.current_epoch_blocks_expected ?? 0,
            },
            chunks: {
              produced: validator.current_epoch_chunks_produced ?? 0,
              total: validator.current_epoch_chunks_expected ?? 0,
            },
          },
          stake: current,
        }
      : undefined,
    description: description(validator),
    nextEpoch: validator.next_epoch_stake
      ? { stake: validator.next_epoch_stake }
      : undefined,
    percent: validator.own_stake_percent ?? '0.00',
    poolInfo: {
      delegatorsCount: validator.delegators_count,
      fee:
        validator.fee_numerator !== null && validator.fee_denominator !== null
          ? {
              denominator: validator.fee_denominator,
              numerator: validator.fee_numerator,
            }
          : null,
    },
    publicKey: validator.public_key,
    showWarning: !!validator.is_network_holder_warning,
    stakeChange:
      validator.stake_change_symbol && validator.stake_change_value
        ? {
            symbol: validator.stake_change_symbol,
            value: validator.stake_change_value,
          }
        : null,
    stakingStatus: validator.staking_status,
    warning:
      validator.is_network_holder_warning && holderIndex !== null
        ? NETWORK_HOLDER_WARNING(holderIndex + 1)
        : '',
  };
};

/**
 * GET /v1/validators
 *
 * Merges the v3 validator list query with the v3 validator info (config) query
 * and rebuilds the legacy envelope from them.
 *
 * Non-1:1:
 * - `validatorTelemetry` has no v3 source (the telemetry blob is not indexed in
 *   the split schema) — always `[]`.
 * - `epochStatsCheck` carries the v3 `epoch_seat_price` string; v1 emitted the
 *   raw `validator_data.epoch_stats_check` JSON blob it used for the same
 *   purpose (deriving the staking status).
 * - `latestBlock` is rebuilt as `{ height, timestamp }` from validator_config;
 *   v1 echoed the whole RPC latest-block JSON blob.
 * - `currentValidators` counts rows with staking_status active/leaving instead
 *   of the RPC `current_validators` array length.
 * - `lastEpochApy` comes from the precomputed `validator_config.last_epoch_apy`
 *   instead of a per-request RPC call + redis cache (same formula, computed by
 *   the backend job), so no redis caching is done here.
 * - Row ordering is v3's (`current_epoch_stake DESC NULLS LAST, account_id ASC`)
 *   rather than the stored order of the legacy `validator_lists` blob.
 * - `per_page` is capped at 100. `page` IS still honoured (unlike the other
 *   proxied lists): the validator set is a small bounded table and the legacy
 *   handler also sliced it in memory, so the proxy fetches `page * per_page`
 *   rows in one query and slices — no cursor is involved. The one combination
 *   that cannot be served is `page` > 1 together with `per_page` > 100, because
 *   the cap would silently move the slice (v1 pages of 250 are not pages of
 *   100) — that is a 422 naming `per_page`.
 * - Per-row `index` and `telemetry` are not emitted; `warning` is rebuilt from
 *   the precomputed `is_network_holder_warning` flag + the global
 *   `network_holder_index` (v1 used the in-page index, which only matched on
 *   page 1).
 */
const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const perPage = Math.min(req.validator.data.per_page, 100);

  if (page > 1 && req.validator.data.per_page > 100) {
    return res.status(422).json({
      errors: [
        {
          message:
            'per_page is capped at 100, so page cannot be combined with a larger per_page',
          path: ['per_page'],
        },
      ],
    });
  }

  const [info, validators] = await Promise.all([
    dbBase.oneOrNone<ValidatorInfo>(sql.info),
    dbBase.manyOrNone<Validator>(sql.list, {
      accountDir: 'ASC',
      cursor: { account_id: '', stake: null },
      direction: 'desc',
      has_cursor: false,
      limit: page * perPage,
      nullsOrd: 'LAST',
      stakeDir: 'DESC',
    }),
  ]);

  if (!info || !validators.length) {
    return res.status(200).json(EMPTY);
  }

  const latestBlock: LatestBlock = {
    height: Number(info.latest_block_height ?? 0),
    timestamp: Number(info.latest_block_timestamp ?? 0),
  };
  const epochStartBlock = {
    height: Number(info.epoch_start_height ?? 0),
    timestamp: Number(info.epoch_start_timestamp ?? 0),
  } as BlockHeader;
  const protocolConfig = {
    epochLength: info.protocol_epoch_length ?? 0,
  } as ProtocolConfig;

  const epochProgressData = epochProgress(
    latestBlock,
    epochStartBlock,
    protocolConfig,
  );
  const timeRemainingData = timeRemaining(
    latestBlock,
    epochStartBlock,
    epochProgressData,
  );

  const validatorFullData = validators
    .slice((page - 1) * perPage)
    .map((validator) => validatorData(validator, info.network_holder_index));

  return res.status(200).json({
    currentValidators: info.current_validators_count ?? 0,
    elapsedTimeData: elapsedTime(epochStartBlock),
    epochProgressData,
    epochStatsCheck: info.epoch_seat_price,
    lastEpochApy: info.last_epoch_apy ?? '0',
    latestBlock,
    total: info.total_validators_count ?? 0,
    totalSeconds: timeRemainingData ? Math.floor(+timeRemainingData / 1000) : 0,
    totalStake: info.total_stake ?? 0,
    validatorFullData,
    validatorTelemetry: [],
  });
});

export default { list };
