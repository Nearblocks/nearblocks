import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { getLatestBlock, getLatestReceipt } from '#libs/sync';

const TIME_RANGE = 300; // 5m

const isInSync = (timestamp: string) =>
  dayjs.utc().unix() - +timestamp.slice(0, 10) <= TIME_RANGE;

const base = catchAsync(async (_req: Request, res: Response) => {
  const latestBlock = await getLatestBlock();

  const height = latestBlock?.[0]?.block_height;
  const timestamp = latestBlock?.[0]?.block_timestamp;
  const sync = isInSync(timestamp);

  if (sync) {
    return res.status(200).json({ height, sync, timestamp });
  }

  return res.status(503).json({ height, sync, timestamp });
});

const receipts = catchAsync(async (_req: Request, res: Response) => {
  const latestReceipt = await getLatestReceipt();

  const height = latestReceipt?.[0]?.block_height;
  const timestamp = latestReceipt?.[0]?.block_timestamp;
  const sync = isInSync(timestamp);

  if (sync) {
    return res.status(200).json({ height, sync, timestamp });
  }

  return res.status(503).json({ height, sync, timestamp });
});

export default { base, receipts };
