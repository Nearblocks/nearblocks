import { Request, Response } from 'express';

import { Setting } from 'nb-types';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { viewBlock } from '#libs/near';
import sql from '#libs/postgres';
import redis from '#libs/redis';

const EXPIRY = 5; // 5 sec
const DATE_RANGE = 2;
const BLOCK_RANGE = 250;

const isBlockInSync = (height: number) => height <= BLOCK_RANGE;
const isDateInSync = (date: string) =>
  dayjs.utc().diff(dayjs.utc(date), 'day') <= DATE_RANGE;

const status = catchAsync(async (_req: Request, res: Response) => {
  const [settings, block, rpcBlock, stats, statsNew] = await redis.cache(
    'sync:settings',
    async () => {
      return await Promise.all([
        sql`
          SELECT
            *
          FROM
            settings
        `,
        sql`
          SELECT
            block_height
          FROM
            blocks
          ORDER BY
            block_height DESC
          LIMIT
            1
        `,
        viewBlock({ finality: 'final' }),
        sql`
          SELECT
            date
          FROM
            daily_stats
          ORDER BY
            date DESC
          LIMIT
            1
        `,
        sql`
          SELECT
            date
          FROM
            daily_stats_new
          ORDER BY
            date DESC
          LIMIT
            1
        `,
      ]);
    },
    EXPIRY,
  );

  if (!rpcBlock) {
    return res.status(500).json({ message: 'RPC Error' });
  }

  const latestBlock = rpcBlock?.header?.height;
  const events = settings.find((item: Setting) => item.key === 'events');
  const balance = settings.find((item: Setting) => item.key === 'balance');
  const ftHolders = settings.find((item: Setting) => item.key === 'ft_holders');
  const nftHolders = settings.find(
    (item: Setting) => item.key === 'nft_holders',
  );
  const eventSnapshots = settings.find(
    (item: Setting) => item.key === 'event-snapshots',
  );
  const deletedAccounts = settings.find(
    (item: Setting) => item.key === 'deleted-accounts',
  );

  const [ftHoldersTime, nftHoldersTime] = await Promise.all([
    ftHolders?.value?.sync
      ? sql`
          SELECT
            block_timestamp
          FROM
            blocks
          WHERE
            block_height = ${ftHolders.value.sync}
        `
      : null,
    nftHolders?.value?.sync
      ? sql`
          SELECT
            block_timestamp
          FROM
            blocks
          WHERE
            block_height = ${nftHolders.value.sync}
        `
      : null,
  ]);

  const status = {
    aggregates: {
      ft_holders: {
        height: ftHolders?.value?.sync,
        sync: isBlockInSync(latestBlock - ftHolders?.value?.sync),
        timestamp: ftHoldersTime?.[0]?.block_timestamp,
      },
      nft_holders: {
        height: nftHolders?.value?.sync,
        sync: isBlockInSync(latestBlock - nftHolders?.value?.sync),
        timestamp: nftHoldersTime?.[0]?.block_timestamp,
      },
    },
    indexers: {
      balance: {
        height: balance?.value?.sync,
        sync: isBlockInSync(latestBlock - balance?.value?.sync),
      },
      base: {
        height: block?.[0]?.block_height,
        sync: isBlockInSync(latestBlock - block?.[0]?.block_height),
      },
      events: {
        height: events?.value?.sync,
        sync: isBlockInSync(latestBlock - events?.value?.sync),
      },
    },
    jobs: {
      daily_stats: {
        date: stats?.[0]?.date,
        sync: isDateInSync(stats?.[0]?.date),
      },
      daily_stats_new: {
        date: statsNew?.[0]?.date,
        sync: isDateInSync(statsNew?.[0]?.date),
      },
      deleted_accounts: {
        height: deletedAccounts?.value?.sync,
        sync: isBlockInSync(latestBlock - deletedAccounts?.value?.sync),
      },
      event_snapshots: {
        date: eventSnapshots?.value?.date,
        sync: isDateInSync(eventSnapshots?.value?.date),
      },
    },
  };

  return res.status(200).json({ status });
});

export default { status };
