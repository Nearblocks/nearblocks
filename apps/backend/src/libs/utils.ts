import { Big } from 'big.js';

const MS_PER_NS = Big(10).pow(6);
const YOCTO_PER_NEAR = Big(10).pow(24);

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const msToNsTime = (ms: number | string) => {
  return Big(ms).mul(MS_PER_NS).toFixed();
};

export const nsToMsTime = (ns: number | string) => {
  return Big(ns).div(MS_PER_NS).toNumber();
};

export const yoctoToNear = (yocto: number | string) => {
  return Big(yocto).div(YOCTO_PER_NEAR).toFixed();
};

export const fiatValue = (amount: number | string, price: number | string) => {
  return Big(amount).mul(Big(price)).toFixed();
};

export const txnFees = (
  tokensBurntByTxn: number | string,
  tokensBurntByReceipts: number | string,
) => {
  return Big(tokensBurntByTxn).add(Big(tokensBurntByReceipts)).toFixed();
};

export const decodeResults = <T>(buffer: ArrayBuffer): T =>
  JSON.parse(Buffer.from(buffer).toString());

export const tokenAmount = (amount: string, decimal = 18) => {
  if (amount === undefined || amount === null) return '';

  return Big(amount).div(Big(10).pow(+decimal)).toFixed();
};
