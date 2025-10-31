import Big from 'big.js';
import { ethers } from 'ethers';

export const accountToHex = (accountId: string): string => {
  return '0x' + ethers.id(accountId).slice(26);
};

export const encodeArgs = (args: unknown) => {
  return Buffer.from(JSON.stringify(args)).toString('base64');
};

export const tokenAmount = (
  amount: string,
  decimal?: null | number,
): string => {
  if (!decimal) return amount;

  return Big(amount).div(Big(10).pow(decimal)).toFixed();
};
