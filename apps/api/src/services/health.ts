import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { getLatestBlock, getLatestReceipt } from '#libs/sync';

const TIME_RANGE = 30; // 30s

const base = catchAsync(async (_req: Request, res: Response) => {
  const latestBlock = await getLatestBlock();

  const timestamp = latestBlock?.[0]?.block_timestamp;

  if (dayjs.utc().unix() - +timestamp.slice(0, 10) <= TIME_RANGE) {
    return res.status(200).end();
  }

  return res.status(503).end();
});

const receipts = catchAsync(async (_req: Request, res: Response) => {
  const latestReceipt = await getLatestReceipt();

  const timestamp = latestReceipt?.[0]?.included_in_block_timestamp;

  if (dayjs.utc().unix() - +timestamp.slice(0, 10) <= TIME_RANGE) {
    return res.status(200).end();
  }

  return res.status(503).end();
});

export default { base, receipts };
