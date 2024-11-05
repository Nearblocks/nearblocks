import { createRequire } from 'module';

import Big from 'big.js';
import { chunk } from 'lodash-es';

import { logger } from 'nb-logger';
import { Block } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';

import knex from './knex.js';
import { nearBalance } from './near.js';

const require = createRequire(import.meta.url);
const lockup = require('nb-lockup');

const getLockupAccounts = async () => {
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
    .orderBy('accounts.created_by_block_height')
    .select('accounts.account_id');
};

export const circulatingSupply = async (block: Block) => {
  let lockedAmount = Big(0);
  const foundationAccounts = ['contributors.near', 'lockup.near'];

  const lockupAccounts = await getLockupAccounts();
  const chunks = chunk(lockupAccounts, 2);
  const count = chunks.length;

  logger.warn({ accounts: count * 2, job: 'daily-stats' });

  for (let index = 0; index < count; index++) {
    const accounts = chunks[index];

    await Promise.all(
      accounts.map(async (account) => {
        await retry(async () => {
          try {
            const amount = await lockup.locked(
              config.rpcUrl2,
              account.account_id,
              +block.block_height,
              block.block_timestamp,
            );

            lockedAmount = lockedAmount.add(amount);
          } catch (error) {
            if (
              error instanceof Error &&
              error?.message.includes('does not exist while viewing')
            ) {
              return;
            }

            throw error;
          }
        });
      }),
    );
  }

  const foundationLockedTokens = await Promise.all(
    foundationAccounts.map(async (account) => {
      return await retry(async () => {
        try {
          const amount = await nearBalance(account, +block.block_height);

          if (amount) return Big(amount);
          return Big(0);
        } catch (error) {
          if (
            error instanceof Error &&
            error?.message.includes('does not exist while viewing')
          ) {
            return Big(0);
          }

          throw error;
        }
      });
    }),
  );

  const foundationLockedAmount = foundationLockedTokens.reduce(
    (acc, current) => acc.add(current),
    Big(0),
  );

  logger.warn({
    foundationLockedAmount: foundationLockedAmount.toFixed(),
    lockedAmount: lockedAmount.toFixed(),
    totalSupply: block.total_supply,
  });

  return Big(block.total_supply)
    .sub(foundationLockedAmount)
    .sub(lockedAmount)
    .toFixed();
};
