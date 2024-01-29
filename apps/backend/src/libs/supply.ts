import Big from 'big.js';
import {
  BlockReference,
  ConnectOptions,
  getLockedTokenAmount,
  viewAccountBalance,
  viewLockupState,
} from 'near-lockup-helper';

import { Block } from 'nb-types';
import { retry, sleep } from 'nb-utils';

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
  try {
    let lockedAmount = Big(0);
    const foundationAccounts = ['contributors.near', 'lockup.near'];
    const blockRef: BlockReference = { block_id: +block.block_height };

    const lockupAccounts = await getLockupAccounts(block.block_height);
    const count = lockupAccounts.length;

    console.log({ count, job: 'circulating-supply' });

    for (let index = 0; index < count; index++) {
      const account = lockupAccounts[index];

      await retry(async ({ attempt }) => {
        try {
          console.log({ account, attempt, index, job: 'circulating-supply' });
          await sleep(Math.floor(Math.random() * (100 - 10 + 1) + 10));
          const lockupState = await viewLockupState(
            account.account_id,
            options,
            blockRef,
          );

          if (!lockupState) return;

          const amount = getLockedTokenAmount(lockupState).toString();

          console.log({
            account,
            amount,
            index,
            job: 'circulating-supply',
          });

          lockedAmount = lockedAmount.add(amount);
        } catch (error) {
          console.log({
            account,
            attempt,
            error,
            index,
            job: 'circulating-supply',
          });

          if (
            error instanceof Error &&
            error?.message.includes('does not exist while viewing')
          ) {
            return;
          }

          if (attempt >= 3) return;

          throw error;
        }
      });
    }

    const foundationLockedTokens = await Promise.all(
      foundationAccounts.map(async (account) => {
        return await retry(async ({ attempt }) => {
          try {
            console.log({ account, attempt, job: 'circulating-supply' });
            const resp = await viewAccountBalance(account, options, blockRef);

            return Big(resp.amount.toString());
          } catch (error) {
            if (
              error instanceof Error &&
              error?.message.includes('does not exist while viewing')
            ) {
              return Big(0);
            }

            if (attempt >= 3) return Big(0);

            throw error;
          }
        });
      }),
    );

    const foundationLockedAmount = foundationLockedTokens.reduce(
      (acc, current) => acc.add(current),
      Big(0),
    );

    console.log({
      foundationLockedAmount: foundationLockedAmount.toFixed(),
      lockedAmount: lockedAmount.toFixed(),
      totalSupply: block.total_supply,
    });

    return Big('1174473231334933968283134274377401')
      .sub(foundationLockedAmount)
      .sub(lockedAmount)
      .toFixed();
  } catch (error) {
    console.log({ error, job: 'stats' });
    return null;
  }
};
