import { Network } from 'nb-types';

import config from '#config';
import { Layout } from '#types/types';

const mainnet: Record<string, Layout> = {
  'berryclub.ek.near': {
    accountOffset: 1,
    accountPath: null,
    keyEncoding: 'index',
    keyPrefix: Buffer.from('75', 'hex'),
    valueEncoding: 'u128le',
    valueOffset: 24,
    valuePath: null,
  },
  'canvas-war.feiyu.near': {
    accountOffset: 1,
    accountPath: null,
    keyEncoding: 'index',
    keyPrefix: Buffer.from('75', 'hex'),
    valueEncoding: 'u128le',
    valueOffset: 24,
    valuePath: null,
  },
  'pixeltoken.near': {
    accountOffset: null,
    accountPath: 'key',
    keyEncoding: 'index',
    keyPrefix: Buffer.from('623a656e74726965733a3a', 'hex'),
    valueEncoding: 'json',
    valueOffset: null,
    valuePath: 'value.pixeltoken',
  },
  'tipjargon.near': {
    accountOffset: null,
    accountPath: null,
    keyEncoding: 'borsh',
    keyPrefix: Buffer.from('6163', 'hex'),
    valueEncoding: 'u128le',
    valueOffset: 19,
    valuePath: null,
  },
  'token.cheddar.near': {
    accountOffset: null,
    accountPath: null,
    keyEncoding: 'borsh',
    keyPrefix: Buffer.from('61', 'hex'),
    valueEncoding: 'u128le',
    valueOffset: 16,
    valuePath: null,
  },
  'v1.dacha-finance.near': {
    accountOffset: 1,
    accountPath: null,
    keyEncoding: 'index',
    keyPrefix: Buffer.from('01', 'hex'),
    valueEncoding: 'u128le',
    valueOffset: 8,
    valuePath: null,
  },
};

const testnet: Record<string, Layout> = {};

export const staticLayouts: Record<string, Layout> =
  config.network === Network.MAINNET ? mainnet : testnet;

export const PREFIXES: Buffer[] =
  config.network === Network.MAINNET
    ? [
        Buffer.from('00', 'hex'),
        Buffer.from('74', 'hex'),
        Buffer.from('61', 'hex'),
        Buffer.from('6674', 'hex'),
        Buffer.from('01', 'hex'),
        Buffer.from('04', 'hex'),
        Buffer.from('05', 'hex'),
        Buffer.from('03', 'hex'),
        Buffer.from('0c', 'hex'),
        Buffer.from('07', 'hex'),
        Buffer.from('7e2431343101', 'hex'),
        Buffer.from('7374757364', 'hex'),
      ]
    : [];

for (const a of PREFIXES) {
  for (const b of PREFIXES) {
    if (a === b) continue;

    const shorter = a.length <= b.length ? a : b;
    const longer = a.length <= b.length ? b : a;

    if (longer.subarray(0, shorter.length).equals(shorter)) {
      throw new Error(
        `ft-state PREFIXES overlap: ${a.toString('hex')} / ${b.toString(
          'hex',
        )}`,
      );
    }
  }
}
