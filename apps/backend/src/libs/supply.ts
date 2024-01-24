import Big from 'big.js';
import {
  BlockReference,
  ConnectOptions,
  getLockedTokenAmount,
  viewAccountBalance,
  viewLockupState,
} from 'near-lockup-helper';

import { Block } from 'nb-types';

import config from '#config';

import knex from './knex.js';

const options: ConnectOptions = {
  networkId: config.network,
  nodeUrl: config.rpcUrl,
};

const getLockupAccounts = async (blockHeight: number) => {
  return knex('accounts')
    .leftJoin(
      'receipts as receipts_start',
      'accounts.created_by_receipt_id',
      'receipts_start.receipt_id',
    )
    .leftJoin(
      'blocks as blocks_start',
      'receipts_start.included_in_block_hash',
      'blocks_start.block_hash',
    )
    .leftJoin(
      'receipts as receipts_end',
      'accounts.deleted_by_receipt_id',
      'receipts_end.receipt_id',
    )
    .leftJoin(
      'blocks as blocks_end',
      'receipts_end.included_in_block_hash',
      'blocks_end.block_hash',
    )
    .where('accounts.account_id', 'like', '%.lockup.near')
    .where(
      knex.raw(
        '(blocks_start.block_height IS NULL OR blocks_start.block_height <= ?)',
        [blockHeight],
      ),
    )
    .where(
      knex.raw(
        '(blocks_end.block_height IS NULL OR blocks_end.block_height >= ?)',
        [blockHeight],
      ),
    )
    .select('accounts.account_id');
};

export const circulatingSupply = async (block: Block) => {
  const foundationAccounts = ['contributors.near', 'lockup.near'];
  const blockRef: BlockReference = { block_id: +block.block_height };

  const lockupAccounts = await getLockupAccounts(block.block_height);

  const lockedTokens = await Promise.all(
    lockupAccounts.map(async (account) => {
      const lockupState = await viewLockupState(
        account.account_id,
        options,
        blockRef,
      );

      if (lockupState) {
        return Big((await getLockedTokenAmount(lockupState)).toString());
      } else {
        return Big(0);
      }
    }),
  );

  const lockedAmount = lockedTokens.reduce(
    (acc, current) => acc.add(current),
    Big(0),
  );

  const foundationLockedTokens = await Promise.all(
    foundationAccounts.map(async (account) => {
      const resp = await viewAccountBalance(account, options, blockRef);

      return Big(resp.amount.toString());
    }),
  );

  const foundationLockedAmount = foundationLockedTokens.reduce(
    (acc, current) => acc.add(current),
    Big(0),
  );

  return Big(block.total_supply)
    .sub(foundationLockedAmount)
    .sub(lockedAmount)
    .toString();
};
