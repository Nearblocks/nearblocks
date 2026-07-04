import { Request, Response } from 'express';

import { Setting } from 'nb-types';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import logger from '#libs/logger';
import {
  getBlock,
  getLatestBlock,
  getLatestStats,
  getSettings,
} from '#libs/sync';

const DATE_RANGE = 2; // 2d
const BLOCK_RANGE = 600; // 10m
const EVENT_RANGE = 600; // 10m
const BLOCK_HEIGHT_RANGE = 60; // ~1m of blocks

const isInSync = (timestamp: string) =>
  dayjs.utc().unix() - +timestamp.slice(0, 10) <= BLOCK_RANGE;
const isEventInSync = (latest: number, current: number) =>
  +latest - +current <= EVENT_RANGE;
const isDateInSync = (date: string) =>
  dayjs.utc().diff(dayjs.utc(date), 'day') <= DATE_RANGE;
// A synced block missing from `blocks` (written by the base indexer) means this
// indexer is at or ahead of base's tip, i.e. it is not behind. Treat it as in
// sync as long as it isn't far behind the latest block, so a genuinely stalled
// indexer still surfaces as out of sync.
const isAheadOfBase = (indexerHeight: number, latestHeight?: number) =>
  latestHeight != null && latestHeight - indexerHeight <= BLOCK_HEIGHT_RANGE;

const getBaseStatus = async () => {
  const latestBlock = await getLatestBlock();

  const height = latestBlock?.[0]?.block_height;
  const timestamp = latestBlock?.[0]?.block_timestamp;

  return { height, sync: isInSync(timestamp), timestamp };
};

const getIndexerStatus = async (key: string) => {
  const settings = await getSettings();

  const indexerHeight = settings.find((item: Setting) => item.key === key)
    ?.value?.sync;

  if (!indexerHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  const syncedBlock = await getBlock(+indexerHeight);

  if (!syncedBlock?.[0]) {
    // Not in `blocks` yet → indexer is at/ahead of base's tip, not behind.
    const latestBlock = await getLatestBlock();
    const latestHeight = latestBlock?.[0]?.block_height;
    const sync = isAheadOfBase(+indexerHeight, latestHeight);

    if (!sync) {
      logger.warn({ indexerHeight, key, latestHeight });
    }

    return { height: indexerHeight, sync, timestamp: null };
  }

  const height = syncedBlock[0].block_height;
  const timestamp = syncedBlock[0].block_timestamp;

  return { height, sync: isInSync(timestamp), timestamp };
};

const getBalanceStatus = () => getIndexerStatus('balance');
const getEventStatus = () => getIndexerStatus('events');

const getFTHoldersStatus = async () => {
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
  // blocks of it. Both heights come from settings, so this holds even when the
  // exact block row isn't in `blocks` yet.
  const eventInSync = isEventInSync(+eventsHeight, +ftHoldersHeight);
  const syncedBlock = await getBlock(+ftHoldersHeight);

  if (!syncedBlock?.[0]) {
    return { height: ftHoldersHeight, sync: eventInSync, timestamp: null };
  }

  const height = syncedBlock[0].block_height;
  const timestamp = syncedBlock[0].block_timestamp;

  return {
    height,
    sync: isInSync(timestamp) || eventInSync,
    timestamp,
  };
};

const getNFTHoldersStatus = async () => {
  const settings = await getSettings();

  const nftHoldersHeight = settings.find(
    (item: Setting) => item.key === 'nft_holders_new',
  )?.value?.sync;

  if (!nftHoldersHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  const [syncedBlock, latestBlock] = await Promise.all([
    getBlock(+nftHoldersHeight),
    getLatestBlock(),
  ]);

  // nft_holders trails the chain tip; in sync when within EVENT_RANGE blocks of
  // the latest block, even if its exact block row isn't in `blocks` yet.
  const latestHeight = latestBlock?.[0]?.block_height;
  const heightInSync =
    !!latestHeight && isEventInSync(+latestHeight, +nftHoldersHeight);

  if (!syncedBlock?.[0]) {
    return { height: nftHoldersHeight, sync: heightInSync, timestamp: null };
  }

  const height = syncedBlock[0].block_height;
  const timestamp = syncedBlock[0].block_timestamp;

  return {
    height,
    sync: isInSync(timestamp) || heightInSync,
    timestamp,
  };
};

const getStatStatus = async () => {
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
