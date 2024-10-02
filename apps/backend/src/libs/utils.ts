import Big from 'big.js';
import { ethers } from 'ethers';

import { logger } from 'nb-logger';

import Sentry from '#libs/sentry';

export const splitArray = <T>(array: T[]): [T[], T[]] => {
  if (!array || !array.length) return [[], []];

  const length = array.length;
  const midpoint = Math.ceil(length / 2);

  if (length === 1) return [array, []];

  return [array.slice(0, midpoint), array.slice(midpoint, length)];
};

export const SECOND = 1;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const validator = {
  accountIdSuffix: {
    lockup: 'lockup.near',
    stakingPool: {
      mainnet: '.poolv1.near',
      testnet: undefined,
    },
  },
};

export const errorHandler = (error: Error) => {
  logger.error(error);
  Sentry.captureException(error);
};

export const tokenAmount = (amount: string, decimal: number) => {
  if (amount === undefined || amount === null) return '';

  return Big(amount).div(Big(10).pow(+decimal)).toFixed();
};

export function accountToHex(accountId: string): string {
  const hash = ethers.id(accountId);
  const hexAddress = '0x' + hash.slice(26);
  return hexAddress;
}
