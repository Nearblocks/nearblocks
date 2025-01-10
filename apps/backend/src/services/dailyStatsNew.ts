import Big from 'big.js';
import { Dayjs } from 'dayjs';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { msToNsTime, nsToMsTime, sleep, yoctoToNear } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';

type RawResp = {
  rows: CountResp[];
};

type CountResp = {
  count: number | string;
};

const marketData = async (date: Dayjs) => {
  if (config.network === Network.TESTNET) {
    return {
      market_cap: null,
      near_price: null,
    };
  }

  const start = date.format('DD-MM-YYYY');
  const history = await cg.marketHistory(start);

  logger.warn({ history, start });

  if (!history) {
    throw Error('market request failed');
  }

  return {
    market_cap: history.market_cap || '0',
    near_price: history.price || '0',
  };
};

const blockData = async (day: Dayjs) => {
  const start = msToNsTime(day.clone().startOf('day').valueOf());
  const end = msToNsTime(day.clone().add(1, 'day').startOf('day').valueOf());

  const [blocks, lastBlock, gasUsed] = await Promise.all([
    knex('blocks')
      .where('block_timestamp', '>=', start)
      .where('block_timestamp', '<', end)
      .count()
      .first(),
    knex('blocks')
      .where('block_timestamp', '>=', start)
      .where('block_timestamp', '<', end)
      .orderBy('block_timestamp', 'desc')
      .limit(1)
      .first(),
    knex('blocks')
      .join('chunks', 'chunks.included_in_block_hash', 'blocks.block_hash')
      .where('blocks.block_timestamp', '>=', start)
      .where('blocks.block_timestamp', '<', end)
      .sum({ sum: 'chunks.gas_used' })
      .first(),
  ]);

  let supply: null | string = null;

  if (config.network === Network.MAINNET && lastBlock) {
    const stats = await knex('stats').first();

    if (stats) {
      supply = stats?.circulating_supply;
    }
  }

  return {
    blocks: blocks?.count?.toString(),
    circulating_supply: supply,
    gas_fee: Big(gasUsed?.sum ?? 0)
      .mul(Big(lastBlock?.gas_price ?? 0))
      .toString(),
    gas_used: gasUsed?.sum?.toString(),
    total_supply: lastBlock?.total_supply,
  };
};

const txnData = async (start: string, end: string, price?: null | string) => {
  const [txns, volume, tokensBurntByTxn, tokensBurntByReceipts] =
    await Promise.all([
      knex('transactions')
        .where('block_timestamp', '>=', start)
        .where('block_timestamp', '<', end)
        .count()
        .first(),
      knex('action_receipt_actions')
        .where('receipt_included_in_block_timestamp', '>=', start)
        .where('receipt_included_in_block_timestamp', '<', end)
        .where('action_kind', 'IN', ['FUNCTION_CALL', 'TRANSFER'])
        .sum({ sum: knex.raw("CAST(args->>'deposit' as NUMERIC)") })
        .first(),
      knex('transactions')
        .where('block_timestamp', '>=', start)
        .where('block_timestamp', '<', end)
        .sum('tokens_burnt')
        .first(),
      knex('execution_outcomes')
        .where('executed_in_block_timestamp', '>=', start)
        .where('executed_in_block_timestamp', '<', end)
        .sum('tokens_burnt')
        .first(),
    ]);

  const volumeNear = yoctoToNear(volume?.sum || 0);
  const volumeUSD = Big(volumeNear)
    .mul(price || 0)
    .toFixed();

  const txnFee = Big(tokensBurntByTxn?.sum || 0)
    .add(tokensBurntByReceipts?.sum || 0)
    .toFixed();

  const txnFeeNear = yoctoToNear(txnFee);
  const txnFeeUsd = Big(txnFeeNear)
    .mul(price || 0)
    .toFixed();

  return {
    txn_fee: txnFee,
    txn_fee_usd: txnFeeUsd,
    txn_volume: volume?.sum?.toString(),
    txn_volume_usd: volumeUSD,
    txns: txns?.count?.toString(),
  };
};

const addressData = async (start: string, end: string) => {
  const [
    newAccounts,
    deletedAccounts,
    activeAccounts,
    newContracts,
    activeContracts,
  ] = await Promise.all([
    knex('accounts as a')
      .join('blocks as b', 'b.block_height', '=', 'a.created_by_block_height')
      .where('b.block_timestamp', '>=', start)
      .where('b.block_timestamp', '<', end)
      .count('a.created_by_block_height')
      .first(),
    knex('accounts as a')
      .join('blocks as b', 'b.block_height', '=', 'a.deleted_by_block_height')
      .where('b.block_timestamp', '>=', start)
      .where('b.block_timestamp', '<', end)
      .count('a.deleted_by_block_height')
      .first(),
    knex.raw<RawResp>(
      `
        SELECT
          COUNT(*)
        FROM
          (
            WITH
              distinct_signers AS (
                SELECT DISTINCT
                  "signer_account_id"
                FROM
                  "transactions"
                WHERE
                  "block_timestamp" >= ?
                  AND "block_timestamp" < ?
              )
            SELECT
              *
            FROM
              distinct_signers
          ) AS subquery;
      `,
      [start, end],
    ),
    knex.raw<RawResp>(
      `
        SELECT
          COUNT(*)
        FROM
          (
            SELECT DISTINCT
              r.receiver_account_id
            FROM
              (
                SELECT
                  receipt_id,
                  receiver_account_id
                FROM
                  receipts
                WHERE
                  included_in_block_timestamp >= ?
                  AND included_in_block_timestamp < ?
              ) AS r
              INNER JOIN action_receipt_actions AS a ON a.receipt_id = r.receipt_id
            WHERE
              a.action_kind = 'DEPLOY_CONTRACT'
          ) AS subquery
      `,
      [start, end],
    ),
    knex.raw<RawResp>(
      `
        SELECT
          COUNT(*)
        FROM
          (
            WITH
              distinct_receivers AS (
                SELECT DISTINCT
                  receipt_receiver_account_id
                FROM
                  action_receipt_actions
                WHERE
                  action_kind = 'FUNCTION_CALL'
                  AND receipt_included_in_block_timestamp >= ?
                  AND receipt_included_in_block_timestamp < ?
              )
            SELECT
              *
            FROM
              distinct_receivers
          ) AS subquery;
      `,
      [start, end],
    ),
  ]);

  await knex.raw(
    `
      INSERT INTO deployed_contracts (
        contract,
        code_sha256,
        receipt_id,
        block_hash,
        block_timestamp
      )
      SELECT
        action_receipt_actions.receipt_receiver_account_id as contract,
        action_receipt_actions.args->>'code_sha256' as code_sha256,
        action_receipt_actions.receipt_id as receipt_id,
        execution_outcomes.executed_in_block_hash as block_hash,
        execution_outcomes.executed_in_block_timestamp as block_timestamp
      FROM action_receipt_actions
      JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
      WHERE action_receipt_actions.action_kind = 'DEPLOY_CONTRACT'
        AND execution_outcomes.status = 'SUCCESS_VALUE'
        AND execution_outcomes.executed_in_block_timestamp >= ?
        AND execution_outcomes.executed_in_block_timestamp < ?
      ON CONFLICT (receipt_id) DO NOTHING
    `,
    [start, end],
  );

  const uniqueContracts = await knex.raw<RawResp>(
    `
      SELECT
        COUNT(*)
      FROM
        (
          WITH
            distinct_contracts AS (
              SELECT DISTINCT
                code_sha256
              FROM
                deployed_contracts
              WHERE
                block_timestamp >= ?
                AND block_timestamp < ?
            )
          SELECT
            *
          FROM
            distinct_contracts
        ) AS subquery;
    `,
    [start, end],
  );

  return {
    active_accounts: activeAccounts?.rows?.[0]?.count.toString(),
    active_contracts: activeContracts?.rows?.[0]?.count?.toString(),
    deleted_accounts: deletedAccounts?.count?.toString(),
    new_accounts: newAccounts?.count?.toString(),
    new_contracts: newContracts?.rows?.[0]?.count?.toString(),
    unique_contracts: uniqueContracts?.rows?.[0]?.count?.toString(),
  };
};

const multiChainTxnData = async (start: string, end: string) => {
  const multiChainTxns = await knex('multichain_transactions')
    .where('block_timestamp', '>=', start)
    .where('block_timestamp', '<', end)
    .count()
    .first();

  return {
    multichain_txns: multiChainTxns?.count?.toString(),
  };
};

const dayStats = async (day: Dayjs) => {
  if (dayjs.utc().isSameOrBefore(day)) return;

  const start = msToNsTime(day.clone().startOf('day').valueOf());
  const end = msToNsTime(day.clone().add(1, 'day').startOf('day').valueOf());

  const price = await marketData(day.clone());
  const [block, txn, address, multiChainTxn] = await Promise.all([
    blockData(day.clone()),
    addressData(start, end),
    txnData(start, end, price.near_price),
    multiChainTxnData(start, end),
  ]);

  const data = {
    date: day.format('YYYY-MM-DD'),
    ...price,
    ...block,
    ...txn,
    ...address,
    ...multiChainTxn,
  };

  await knex('daily_stats_new').insert(data);
};

export const syncStats = async () => {
  let start = dayjs.utc(config.genesisDate);
  const latestBlock = await knex
    .table('blocks')
    .orderBy('block_timestamp', 'desc')
    .first();

  if (!latestBlock || dayjs.utc().isSameOrBefore(start, 'day')) return;

  const end = dayjs
    .utc(nsToMsTime(latestBlock.block_timestamp))
    .startOf('day')
    .subtract(1, 'day');

  const latestStat = await knex
    .table('daily_stats_new')
    .orderBy('date', 'desc')
    .first();

  if (latestStat) {
    start = dayjs.utc(latestStat.date).add(1, 'day');
  }

  let diff = end.diff(start, 'day');
  diff = diff < 20 ? diff + 1 : 20;

  if (diff < 1) return;

  const days = Array.from({ length: diff }, (_, index) => index);

  for (const day of days) {
    const date = start.clone().add(day, 'day');

    await dayStats(date);
    await sleep(1000);
  }
};
