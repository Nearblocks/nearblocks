import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import { msToNsTime, yoctoToNear } from '#libs/utils';

const supply = catchAsync(async (_req: Request, res: Response) => {
  const { rows } = await db.query(
    `
      SELECT
        *
      FROM
        stats
      LIMIT
        1
    `,
  );

  return res.status(200).json({
    circulating_supply_in_yoctonear: rows?.[0]?.circulating_supply,
    timestamp: msToNsTime(dayjs.utc().startOf('day').valueOf()),
  });
});

const supplyInNear = catchAsync(async (_req: Request, res: Response) => {
  const { rows } = await db.query(
    `
      SELECT
        *
      FROM
        stats
      LIMIT
        1
    `,
  );

  return res.status(200).json(yoctoToNear(rows?.[0]?.circulating_supply));
});

export default { supply, supplyInNear };
