import { createRequire } from 'module';

import Big from 'big.js';

import { retry } from 'nb-utils';

import config from '#config';
import { fetchAccount } from '#libs/near';
import { AccountId, BlockSupply } from '#types/types';

const require = createRequire(import.meta.url);
const lockup = require('nb-lockup');

export const getCirculatingSupply = async (
  block: BlockSupply,
  accounts: AccountId[],
) => {
  const lockedAmount = await getLockedAmount(block, accounts);
  const foundationBalance = await getFoundationBalance(block);

  return Big(block.total_supply)
    .sub(foundationBalance)
    .sub(lockedAmount)
    .toFixed();
};

export const getLockedAmount = async (
  block: BlockSupply,
  accounts: AccountId[],
) => {
  let lockedAmount = Big(0);

  for (const account of accounts) {
    await retry(
      async () => {
        try {
          const amount: string = await lockup.locked(
            config.rpcUrl,
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
      },
      { delay: 1000, retries: 3 },
    );
  }

  return lockedAmount;
};

export const getFoundationBalance = async (block: BlockSupply) => {
  let balance = Big(0);
  const accounts = ['contributors.near', 'lockup.near'];

  for (const account of accounts) {
    await retry(
      async () => {
        try {
          const data = await fetchAccount(account, +block.block_height);

          if (data && data.amount) {
            balance = balance.add(data.amount);
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error?.message.includes('does not exist while viewing')
          ) {
            return;
          }

          throw error;
        }
      },
      { delay: 1000, retries: 3 },
    );
  }

  return balance;
};
