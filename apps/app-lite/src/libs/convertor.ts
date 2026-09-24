/* eslint-disable perfectionist/sort-objects */

import Big from 'big.js';

type GasToTgas = (value: string) => string;
type NsToMs = (value: string) => number;
type NsToTimeAgo = (value: string) => string;
type YoctoToNear = (value: string) => string;

export type ConvertorModule = {
  gasToTgas: GasToTgas;
  nsToMs: NsToMs;
  nsToTimeAgo: NsToTimeAgo;
  yoctoToNear: YoctoToNear;
};

const YOCTO_PER_NEAR = Big(10).pow(24);
const MS_PER_NS = Big(10).pow(6);
const T_GAS = Big(10).pow(12);

const convertor = (): ConvertorModule => {
  const yoctoToNear: YoctoToNear = (value) => {
    const yocto: Big = Big(value);

    return yocto.div(YOCTO_PER_NEAR).toString();
  };

  const gasToTgas: GasToTgas = (value) => {
    const near: Big = Big(yoctoToNear(value));

    return near.mul(T_GAS).toString();
  };

  const nsToMs: NsToMs = (value) => {
    const ns: Big = Big(value);

    return ns.div(MS_PER_NS).toNumber();
  };

  const nsToTimeAgo: NsToTimeAgo = (value) => {
    const now = new Date().getTime();
    const diff = now - nsToMs(value);

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    const intervals = [
      { value: second, unit: 'second' },
      { value: minute, unit: 'minute' },
      { value: hour, unit: 'hour' },
      { value: day, unit: 'day' },
      { value: week, unit: 'week' },
      { value: month, unit: 'month' },
      { value: year, unit: 'year' },
    ];

    for (const interval of intervals) {
      if (diff >= interval.value) {
        const count = Math.floor(diff / interval.value);

        return `${count} ${interval.unit}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  };

  return { gasToTgas, nsToMs, nsToTimeAgo, yoctoToNear };
};

export default convertor;
