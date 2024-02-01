import { Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import { Supply } from '#libs/schema/legacy';
import { msToNsTime, yoctoToNear } from '#libs/utils';
import { RequestValidator } from '#types/types';

const supply = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const unit = req.validator.data.unit;

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

    if (unit === 'near') {
      return res.send((+yoctoToNear(rows?.[0]?.circulating_supply)).toFixed());
    }

    return res.status(200).json({
      circulating_supply_in_yoctonear: rows?.[0]?.circulating_supply,
      timestamp: msToNsTime(dayjs.utc().startOf('day').valueOf()),
    });
  },
);

const total = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const unit = req.validator.data.unit;

    const { rows } = await db.query(
      `
        SELECT
          *
        FROM
          blocks
        ORDER BY
          block_timestamp DESC
        LIMIT
          1
      `,
    );

    if (unit === 'near') {
      return res.send((+yoctoToNear(rows?.[0]?.total_supply)).toFixed());
    }

    return res.status(200).json({
      timestamp: rows?.[0]?.block_timestamp,
      total_supply_in_yoctonear: rows?.[0]?.total_supply,
    });
  },
);

export default { supply, total };
