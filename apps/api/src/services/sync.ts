import { Request, Response } from 'express';

import { Setting } from 'nb-types';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import sql from '#libs/postgres';
import redis from '#libs/redis';

const EXPIRY = 5; // 5s
const DATE_RANGE = 2; // 2d
const BLOCK_RANGE = 300; // 5m
const EVENT_RANGE = 60; // 1m

const isInSync = (timestamp: string) =>
  dayjs.utc().unix() - +timestamp.slice(0, 10) <= BLOCK_RANGE;
const isEventInSync = (latest: string, current: string) =>
  +latest.slice(0, 10) - +current.slice(0, 10) <= EVENT_RANGE;
const isDateInSync = (date: string) =>
  dayjs.utc().diff(dayjs.utc(date), 'day') <= DATE_RANGE;

const getLatestBlock = async () => {
  return redis.cache(
    'sync:block',
    async () => {
      return await sql`
        SELECT
          block_height,
          block_timestamp
        FROM
          blocks
        ORDER BY
          block_height DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};

const getBlock = (block: number) => {
  return redis.cache(
    `sync:block:${block}`,
    async () => {
      return await sql`
        SELECT
          block_height,
          block_timestamp
        FROM
          blocks
        WHERE
          block_height = ${block}
      `;
    },
    EXPIRY,
  );
};

const getSettings = async () => {
  return redis.cache(
    'sync:settings',
    async () => {
      return await sql`
        SELECT
          *
        FROM
          settings
      `;
    },
    EXPIRY,
  );
};

const getLatestFTEvent = async () => {
  return redis.cache(
    'sync:ft',
    async () => {
      return await sql`
        SELECT
          block_height,
          block_timestamp
        FROM
          ft_events
        ORDER BY
          block_timestamp DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};

const getLatestNFTEvent = async () => {
  return redis.cache(
    'sync:nft',
    async () => {
      return await sql`
        SELECT
          block_height,
          block_timestamp
        FROM
          nft_events
        ORDER BY
          block_timestamp DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};

const getLatestStats = async () => {
  return redis.cache(
    `sync:stats`,
    async () => {
      return await sql`
        SELECT
          date
        FROM
          daily_stats
        ORDER BY
          date DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};

const getBaseStatus = async () => {
  const latestBlock = await getLatestBlock();

  const height = latestBlock?.[0].block_height;
  const timestamp = latestBlock?.[0].block_timestamp;

  return { height, sync: isInSync(timestamp), timestamp };
};

const getBalanceStatus = async () => {
  const settings = await getSettings();

  const balanceHeight = settings.find((item: Setting) => item.key === 'balance')
    ?.value?.sync;

  if (!balanceHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  const syncedBlock = await getBlock(balanceHeight);

  const height = syncedBlock?.[0].block_height;
  const timestamp = syncedBlock?.[0].block_timestamp;

  return { height, sync: isInSync(timestamp), timestamp };
};

const getEventStatus = async () => {
  const settings = await getSettings();

  const eventHeight = settings.find((item: Setting) => item.key === 'events')
    ?.value?.sync;

  if (!eventHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  const syncedBlock = await getBlock(eventHeight);

  const height = syncedBlock?.[0].block_height;
  const timestamp = syncedBlock?.[0].block_timestamp;

  return { height, sync: isInSync(timestamp), timestamp };
};

const getFTHoldersStatus = async () => {
  const settings = await getSettings();

  const ftHoldersHeight = settings.find(
    (item: Setting) => item.key === 'ft_holders',
  )?.value?.sync;

  if (!ftHoldersHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  const [eventBlock, syncedBlock] = await Promise.all([
    getLatestFTEvent(),
    getBlock(ftHoldersHeight),
  ]);

  const height = syncedBlock?.[0].block_height;
  const timestamp = syncedBlock?.[0].block_timestamp;
  const eventTimestamp = eventBlock?.[0].block_timestamp;

  return {
    height,
    sync: isInSync(timestamp) || isEventInSync(eventTimestamp, timestamp),
    timestamp,
  };
};

const getNFTHoldersStatus = async () => {
  const settings = await getSettings();

  const nftHoldersHeight = settings.find(
    (item: Setting) => item.key === 'nft_holders',
  )?.value?.sync;

  if (!nftHoldersHeight) {
    return { height: null, sync: false, timestamp: null };
  }

  const [eventBlock, syncedBlock] = await Promise.all([
    getLatestNFTEvent(),
    getBlock(nftHoldersHeight),
  ]);

  const height = syncedBlock?.[0].block_height;
  const timestamp = syncedBlock?.[0].block_timestamp;
  const eventTimestamp = eventBlock?.[0].block_timestamp;

  return {
    height,
    sync: isInSync(timestamp) || isEventInSync(eventTimestamp, timestamp),
    timestamp,
  };
};

const getStatStatus = async () => {
  const stats = await getLatestStats();

  const date = stats?.[0]?.date;

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
