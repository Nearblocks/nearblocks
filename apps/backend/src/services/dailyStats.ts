import Big from 'big.js';
import { Dayjs } from 'dayjs';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { msToNsTime, nsToMsTime, sleep, yoctoToNear } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
// import { circulatingSupply } from '#libs/supply';

// The timestamp when transfers were enabled in the Mainnet
// Tuesday, 13 October 2020 18:38:58.293
// const TRANSFERS_ENABLED = dayjs(1602614338293);

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

  // let supply: null | string = null;

  // if (
  //   config.network === Network.MAINNET &&
  //   lastBlock &&
  //   day.isSameOrAfter(TRANSFERS_ENABLED, 'day')
  // ) {
  //   supply = await circulatingSupply(lastBlock);
  // }

  return {
    blocks: blocks?.count?.toString(),
    // circulating_supply: supply,
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
        .sum('receipt_conversion_tokens_burnt')
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
  const activeAccounts = await knex('transactions')
    .where('block_timestamp', '>=', start)
    .where('block_timestamp', '<', end)
    .countDistinct('signer_account_id')
    .first();

  return {
    active_accounts: activeAccounts?.count?.toString(),
  };

  // const [
  //   newAccounts,
  //   activeAccounts,
  //   deletedAccounts,
  //   newContracts,
  //   activeContracts,
  //   uniqueContracts,
  // ] = await Promise.all([
  //   knex('accounts as a')
  //     .join('receipts as r', 'r.receipt_id', '=', 'a.created_by_receipt_id')
  //     .where('r.included_in_block_timestamp', '>=', start)
  //     .where('r.included_in_block_timestamp', '<', end)
  //     .count('a.created_by_receipt_id')
  //     .first(),
  //   knex('transactions')
  //     .where('block_timestamp', '>=', start)
  //     .where('block_timestamp', '<', end)
  //     .countDistinct('signer_account_id')
  //     .first(),
  //   knex('accounts as a')
  //     .join('receipts as r', 'r.receipt_id', '=', 'a.deleted_by_receipt_id')
  //     .where('r.included_in_block_timestamp', '>=', start)
  //     .where('r.included_in_block_timestamp', '<', end)
  //     .count('a.deleted_by_receipt_id')
  //     .first(),
  //   knex('action_receipt_actions as a')
  //     .join('receipts as r', 'r.receipt_id', '=', 'a.receipt_id')
  //     .where('r.included_in_block_timestamp', '>=', start)
  //     .where('r.included_in_block_timestamp', '<', end)
  //     .andWhere('a.action_kind', '=', 'DEPLOY_CONTRACT')
  //     .countDistinct({ count: 'r.receiver_account_id' })
  //     .first(),
  //   knex('action_receipt_actions')
  //     .where('receipt_included_in_block_timestamp', '>=', start)
  //     .where('receipt_included_in_block_timestamp', '<', end)
  //     .andWhere('action_kind', '=', 'FUNCTION_CALL')
  //     .countDistinct({ count: 'receipt_receiver_account_id' })
  //     .first(),
  //   knex('deployed_contracts')
  //     .countDistinct({ count: 'code_sha256' })
  //     .where('block_timestamp', '>=', start)
  //     .where('block_timestamp', '<', end)
  //     .first(),
  // ]);

  // await knex.raw(
  //   `
  //     INSERT INTO deployed_contracts (
  //       contract,
  //       code_sha256,
  //       receipt_id,
  //       block_hash,
  //       block_timestamp
  //     )
  //     SELECT
  //       action_receipt_actions.receipt_receiver_account_id as contract,
  //       action_receipt_actions.args->>'code_sha256' as code_sha256,
  //       action_receipt_actions.receipt_id as receipt_id,
  //       execution_outcomes.executed_in_block_hash as block_hash,
  //       execution_outcomes.executed_in_block_timestamp as block_timestamp
  //     FROM action_receipt_actions
  //     JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
  //     WHERE action_receipt_actions.action_kind = 'DEPLOY_CONTRACT'
  //       AND execution_outcomes.status = 'SUCCESS_VALUE'
  //       AND execution_outcomes.executed_in_block_timestamp >= ?
  //       AND execution_outcomes.executed_in_block_timestamp < ?
  //     ON CONFLICT (receipt_id) DO NOTHING
  //   `,
  //   [start, end],
  // );

  // return {
  //   active_accounts: activeAccounts?.count?.toString(),
  //   active_contracts: activeContracts?.count?.toString(),
  //   deleted_accounts: deletedAccounts?.count?.toString(),
  //   new_accounts: newAccounts?.count?.toString(),
  //   new_contracts: newContracts?.count?.toString(),
  //   unique_contracts: uniqueContracts?.count?.toString(),
  // };
};

const dayStats = async (day: Dayjs) => {
  if (dayjs.utc().isSameOrBefore(day)) return;

  console.log({ day: day.toISOString(), job: 'daily-stats' });

  const start = msToNsTime(day.clone().startOf('day').valueOf());
  const end = msToNsTime(day.clone().add(1, 'day').startOf('day').valueOf());

  const price = await marketData(day.clone());
  const [block, txn, address] = await Promise.all([
    blockData(day.clone()),
    addressData(start, end),
    txnData(start, end, price.near_price),
  ]);

  const data = {
    date: day.format('YYYY-MM-DD'),
    ...price,
    ...block,
    ...txn,
    ...address,
  };

  await knex('daily_stats').insert(data);
};

export const syncStats = async () => {
  let start = dayjs.utc(config.genesisDate);
  const latestBlock = await knex
    .table('blocks')
    .orderBy('block_timestamp', 'desc')
    .first();

  logger.info({ job: 'daily-stats', latestBlock, start: start.toISOString() });

  if (!latestBlock || dayjs.utc().isSameOrBefore(start, 'day')) return;

  const end = dayjs
    .utc(nsToMsTime(latestBlock.block_timestamp))
    .startOf('day')
    .subtract(1, 'day');

  const latestStat = await knex
    .table('daily_stats')
    .orderBy('date', 'desc')
    .first();

  if (latestStat) {
    start = dayjs.utc(latestStat.date).add(1, 'day');
  }

  logger.info({
    end: end.toISOString(),
    job: 'daily-stats',
    latestBlock,
    start: start.toISOString(),
  });

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
