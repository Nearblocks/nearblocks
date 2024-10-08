/* eslint-disable perfectionist/sort-objects */
import type * as big from 'big.js';

type NsToMs = (value: string) => number;
type NsToDateTime = (value: string, format: string) => string;
type NsToTimeAgo = (value: string) => string;
type YoctoToNear = (value: string) => string;
type YoctoToTgas = (value: string) => string;

export type ConvertorModule = {
  nsToDateTime: NsToDateTime;
  nsToMs: NsToMs;
  nsToTimeAgo: NsToTimeAgo;
  yoctoToNear: YoctoToNear;
  yoctoToTgas: YoctoToTgas;
};

const YOCTO_PER_NEAR = Big(10).pow(24);
const MS_PER_NS = Big(10).pow(6);
const T_GAS = Big(10).pow(12);

const convertor = (): ConvertorModule => {
  const yoctoToNear: YoctoToNear = (value) => {
    const yocto: big.Big = Big(value);

    return yocto.div(YOCTO_PER_NEAR).toString();
  };

  const yoctoToTgas: YoctoToTgas = (value) => {
    const near: big.Big = Big(yoctoToNear(value));

    return near.mul(T_GAS).toString();
  };

  const nsToMs: NsToMs = (value) => {
    const ns: big.Big = Big(value);

    return ns.div(MS_PER_NS).toNumber();
  };

  const nsToDateTime = (value: number | string, format: string) => {
    const date = new Date(Number(value) / 1e6);

    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hour = date.getUTCHours().toString().padStart(2, '0');
    const minute = date.getUTCMinutes().toString().padStart(2, '0');
    const second = date.getUTCSeconds().toString().padStart(2, '0');

    const replacements: { [key: string]: string } = {
      YYYY: year,
      MM: month,
      DD: day,
      HH: hour,
      mm: minute,
      ss: second,
    };

    let formatted = format;

    for (const [token, value] of Object.entries(replacements)) {
      formatted = formatted.replace(token, value);
    }

    return formatted;
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

  return { nsToMs, nsToDateTime, nsToTimeAgo, yoctoToNear, yoctoToTgas };
};

export default convertor;
