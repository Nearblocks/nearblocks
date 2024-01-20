import Big from 'big.js';
import { Dayjs } from 'dayjs';
import PMap from 'p-map';

import { Network } from 'nb-types';
import { msToNsTime, nsToMsTime, sleep, yoctoToNear } from 'nb-utils';

import config from '#config';
import cg from '#libs/cg';
import dayjs from '#libs/dayjs';
import knex from '#libs/knex';
import { circulatingSupply } from '#libs/supply';

const marketData = async (date: Dayjs) => {
  if (config.network === Network.TESTNET) {
    return {
      market_cap: undefined,
      near_price: undefined,
    };
  }

  const start = date.format('DD-MM-YYYY');
  const history = await cg.marketHistory(start);

  if (!history) {
    throw Error('market request failed');
  }

  return {
    market_cap: history.market_cap || '0',
    near_price: history.price || '0',
  };
};

const blockData = async (start: string, end: string) => {
  const [blocks, latestBlock, gasUsed, gasFee, lastBlock] = await Promise.all([
    knex('blocks')
      .where('block_timestamp', '>=', start)
      .where('block_timestamp', '<', end)
      .whereBetween('block_timestamp', [start, end])
      .count()
      .first(),
    knex('blocks')
      .where('block_timestamp', '>=', start)
      .where('block_timestamp', '<', end)
      .orderBy('block_timestamp', 'desc')
      .limit(1)
      .first('total_supply'),
    knex('blocks')
      .join('chunks', 'chunks.included_in_block_hash', 'blocks.block_hash')
      .where('blocks.block_timestamp', '>=', start)
      .where('blocks.block_timestamp', '<', end)
      .sum({ sum: 'chunks.gas_used' })
      .first(),
    knex('blocks')
      .join('chunks', 'chunks.included_in_block_hash', 'blocks.block_hash')
      .where('blocks.block_timestamp', '>=', start)
      .where('blocks.block_timestamp', '<', end)
      .sum({ sum: knex.raw('chunks.gas_used * blocks.gas_price') })
      .first(),
    knex('blocks')
      .where('block_timestamp', '<', end)
      .orderBy('block_timestamp', 'desc')
      .limit(1)
      .first(),
  ]);

  if (lastBlock) {
    await circulatingSupply(lastBlock);
  }

  return {
    blocks: blocks?.count?.toString(),
    circulating_supply: null,
    gas_fee: gasFee?.sum?.toString(),
    gas_used: gasUsed?.sum?.toString(),
    total_supply: latestBlock?.total_supply,
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
      knex('action_receipt_actions as ara')
        .join(
          'execution_outcomes as eo',
          'eo.receipt_id',
          '=',
          'ara.receipt_id',
        )
        .where('eo.executed_in_block_timestamp', '>=', start)
        .where('eo.executed_in_block_timestamp', '<', end)
        .where('ara.action_kind', 'IN', ['FUNCTION_CALL', 'TRANSFER'])
        .where('eo.status', 'IN', ['SUCCESS_VALUE', 'SUCCESS_RECEIPT_ID'])
        .sum({ sum: knex.raw("CAST(ara.args->>'deposit' as NUMERIC)") })
        .first(),
      knex('transactions')
        .where('block_timestamp', '>=', start)
        .where('block_timestamp', '<', end)
        .sum('receipt_conversion_tokens_burnt')
        .first(),
      knex('execution_outcomes')
        .where('executed_in_block_timestamp', '>=', start)
        .where('executed_in_block_timestamp', '<', end)
        .whereBetween('executed_in_block_timestamp', [start, end])
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
    activeAccounts,
    deletedAccounts,
    newContracts,
    activeContracts,
  ] = await Promise.all([
    knex('accounts as a')
      .join('receipts as r', 'r.receipt_id', '=', 'a.created_by_receipt_id')
      .where('r.included_in_block_timestamp', '>=', start)
      .where('r.included_in_block_timestamp', '<', end)
      .count('a.created_by_receipt_id')
      .first(),
    knex('transactions')
      .where('block_timestamp', '>=', start)
      .where('block_timestamp', '<', end)
      .countDistinct('signer_account_id')
      .first(),
    knex('accounts as a')
      .join('receipts as r', 'r.receipt_id', '=', 'a.deleted_by_receipt_id')
      .where('r.included_in_block_timestamp', '>=', start)
      .where('r.included_in_block_timestamp', '<', end)
      .count('a.deleted_by_receipt_id')
      .first(),
    knex('action_receipt_actions as a')
      .join('receipts as r', 'r.receipt_id', '=', 'a.receipt_id')
      .where('r.included_in_block_timestamp', '>=', start)
      .where('r.included_in_block_timestamp', '<', end)
      .andWhere('a.action_kind', '=', 'DEPLOY_CONTRACT')
      .countDistinct({ count: 'r.receiver_account_id' })
      .first(),
    knex('action_receipt_actions')
      .where('receipt_included_in_block_timestamp', '>=', start)
      .where('receipt_included_in_block_timestamp', '<', end)
      .andWhere('action_kind', '=', 'FUNCTION_CALL')
      .countDistinct({ count: 'receipt_receiver_account_id' })
      .first(),
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

  const uniqueContracts = await knex('deployed_contracts')
    .countDistinct({ count: 'code_sha256' })
    .where('block_timestamp', '>=', start)
    .where('block_timestamp', '<', end)
    .first();

  return {
    active_accounts: activeAccounts?.count?.toString(),
    active_contracts: activeContracts?.count?.toString(),
    deleted_accounts: deletedAccounts?.count?.toString(),
    new_accounts: newAccounts?.count?.toString(),
    new_contracts: newContracts?.count?.toString(),
    unique_contracts: uniqueContracts?.count?.toString(),
  };
};

const dayStats = async (date: string) => {
  const day = dayjs.utc(date);

  if (dayjs.utc().isSameOrBefore(day)) return;

  const start = msToNsTime(day.startOf('day').valueOf());
  const end = msToNsTime(day.add(1, 'day').startOf('day').valueOf());

  const price = await marketData(day);
  const [block, txn, address] = await Promise.all([
    blockData(start, end),
    txnData(start, end, price.near_price),
    addressData(start, end),
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

  let diff = end.diff(start, 'day');
  diff = diff < 20 ? diff + 1 : 20;

  if (diff < 1) return;

  await PMap(
    [...Array(diff)],
    async (_, i) => {
      const date = start.clone().add(i, 'day');

      await dayStats(date.format('YYYY-MM-DD'));
      await sleep(1000);
    },
    { concurrency: 1 },
  );
};
