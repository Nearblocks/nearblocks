import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { getLatestReceipt } from '#libs/sync';

const RECEIPTS_RANGE = 30; // 30s

const receipts = catchAsync(async (_req: Request, res: Response) => {
  const latestReceipt = await getLatestReceipt();

  const timestamp = latestReceipt?.[0]?.included_in_block_timestamp;

  if (dayjs.utc().unix() - +timestamp.slice(0, 10) <= RECEIPTS_RANGE) {
    return res.status(200).end();
  }

  return res.status(503).end();
});

export default { receipts };
