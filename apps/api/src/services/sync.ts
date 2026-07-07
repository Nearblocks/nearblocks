import { Request, Response } from 'express';

import { Network, Setting } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { getLatestBlock, getLatestStats, getSettings } from '#libs/sync';
import {
  getBalanceStatus as v3BalanceStatus,
  getBaseStatus as v3BaseStatus,
  getEventStatus as v3EventStatus,
  getFTHoldersStatus as v3FTHoldersStatus,
  getNFTHoldersStatus as v3NFTHoldersStatus,
  getStatStatus as v3StatStatus,
} from '#services/v3/sync/index';

const useV3 = config.network === Network.TESTNET;

const DATE_RANGE = 2; // 2d
const BLOCK_RANGE = 600; // 10m — base wall-clock freshness
const EVENT_RANGE = 600; // 10m of blocks — max an aggregate may trail
const BLOCK_HEIGHT_RANGE = 300; // ~5m of blocks — max an indexer may trail base

// base freshness: is the latest indexed block recent in wall-clock time?
const isInSync = (timestamp: string) =>
  dayjs.utc().unix() - +timestamp.slice(0, 10) <= BLOCK_RANGE;
// downstream freshness: how far a checkpoint trails a reference height. A
// negative delta (checkpoint ahead of the reference) is always in sync, which
// is normal since indexers stream independently and can lead base.
const isWithin = (reference: number, current: number, range: number) =>
  reference - current <= range;
const isDateInSync = (date: string) =>
  dayjs.utc().diff(dayjs.utc(date), 'day') <= DATE_RANGE;

const getBaseStatus = async () => {
  if (useV3) return v3BaseStatus();

  const latestBlock = await getLatestBlock();

  const height = latestBlock?.[0]?.block_height;
  const timestamp = latestBlock?.[0]?.block_timestamp;

  return { height, sync: !!timestamp && isInSync(timestamp), timestamp };
};

// Downstream indexers consume the same stream as base (which writes `blocks`)
// but independently, so they can lead or trail it. Judge them purely by how far
// their checkpoint trails base's tip — ahead or within range is in sync. Base's
// own wall-clock freshness is checked in getBaseStatus.
const getIndexerStatus = async (key: string) => {
  const [settings, latestBlock] = await Promise.all([
    getSettings(),
    getLatestBlock(),
  ]);

  const indexerHeight = settings.find((item: Setting) => item.key === key)
    ?.value?.sync;
  const latestHeight = latestBlock?.[0]?.block_height;

  if (!indexerHeight || latestHeight == null) {
    return { height: indexerHeight ?? null, sync: false, timestamp: null };
  }

  return {
    height: indexerHeight,
    sync: isWithin(+latestHeight, +indexerHeight, BLOCK_HEIGHT_RANGE),
    timestamp: null,
  };
};

const getBalanceStatus = () =>
  useV3 ? v3BalanceStatus() : getIndexerStatus('balance');
const getEventStatus = () =>
  useV3 ? v3EventStatus() : getIndexerStatus('events');

const getFTHoldersStatus = async () => {
  if (useV3) return v3FTHoldersStatus();

  const settings = await getSettings();

  const eventsHeight = settings.find((item: Setting) => item.key === 'events')
    ?.value?.sync;
  const ftHoldersHeight = settings.find(
    (item: Setting) => item.key === 'ft_holders_new',
  )?.value?.sync;

  if (!ftHoldersHeight || !eventsHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  // ft_holders trails the events indexer; in sync when within EVENT_RANGE
  // blocks of it.
  return {
    height: ftHoldersHeight,
    sync: isWithin(+eventsHeight, +ftHoldersHeight, EVENT_RANGE),
    timestamp: null,
  };
};

const getNFTHoldersStatus = async () => {
  if (useV3) return v3NFTHoldersStatus();

  const [settings, latestBlock] = await Promise.all([
    getSettings(),
    getLatestBlock(),
  ]);

  const nftHoldersHeight = settings.find(
    (item: Setting) => item.key === 'nft_holders_new',
  )?.value?.sync;
  const latestHeight = latestBlock?.[0]?.block_height;

  if (!nftHoldersHeight || latestHeight == null) {
    return { height: nftHoldersHeight ?? null, sync: false, timestamp: null };
  }

  // nft_holders trails the chain tip; in sync when within EVENT_RANGE blocks.
  return {
    height: nftHoldersHeight,
    sync: isWithin(+latestHeight, +nftHoldersHeight, EVENT_RANGE),
    timestamp: null,
  };
};

const getStatStatus = async () => {
  if (useV3) return v3StatStatus();

  const stats = await getLatestStats();

  const date = stats?.[0]?.date;

  if (!date) {
    return { date, sync: false };
  }

  return { date, sync: isDateInSync(date) };
};

const balance = catchAsync(async (_req: Request, res: Response) => {
  const status = await getBalanceStatus();

  return res.status(200).json({ status });
});

const base = catchAsync(async (_req: Request, res: Response) => {
  const status = await getBaseStatus();

  return res.status(200).json({ status });
});

const events = catchAsync(async (_req: Request, res: Response) => {
  const status = await getEventStatus();

  return res.status(200).json({ status });
});

const ft = catchAsync(async (_req: Request, res: Response) => {
  const status = await getFTHoldersStatus();

  return res.status(200).json({ status });
});

const nft = catchAsync(async (_req: Request, res: Response) => {
  const status = await getNFTHoldersStatus();

  return res.status(200).json({ status });
});

const stats = catchAsync(async (_req: Request, res: Response) => {
  const status = await getStatStatus();

  return res.status(200).json({ status });
});

const status = catchAsync(async (_req: Request, res: Response) => {
  const [base, balance, events, ft, nft, stats] = await Promise.all([
    getBaseStatus(),
    getBalanceStatus(),
    getEventStatus(),
    getFTHoldersStatus(),
    getNFTHoldersStatus(),
    getStatStatus(),
  ]);

  const status = {
    aggregates: {
      ft_holders: ft,
      nft_holders: nft,
    },
    indexers: {
      balance,
      base,
      events,
    },
    jobs: {
      daily_stats: stats,
    },
  };

  return res.status(200).json({ status });
});

export default { balance, base, events, ft, nft, stats, status };
