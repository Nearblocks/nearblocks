import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import db from '#libs/db';
import sql from '#libs/postgres';
import { Activities, ActivitiesCount } from '#libs/schema/account';
import { keyBinder } from '#libs/utils';
import { RawQueryParams, RequestValidator } from '#types/types';

const changes = catchAsync(
  async (req: RequestValidator<Activities>, res: Response) => {
    const account = req.validator.data.account;
    const cursor = req.validator.data.cursor;
    const per_page = req.validator.data.per_page;

    const activities = await sql`
      SELECT
        event_index,
        block_height,
        transaction_hash,
        receipt_id,
        affected_account_id,
        involved_account_id,
        direction,
        cause,
        absolute_staked_amount,
        absolute_nonstaked_amount
      FROM
        balance_events
      WHERE
        affected_account_id = ${account}
        AND ${cursor ? sql`event_index < ${cursor}` : true}
      ORDER BY
        event_index DESC
      LIMIT
        ${per_page}
    `;

    let nextCursor = activities?.[activities?.length - 1]?.event_index;
    nextCursor =
      activities?.length === per_page && nextCursor ? nextCursor : undefined;

    return res.status(200).json({ activities, cursor: nextCursor });
  },
);

const changesCount = catchAsync(
  async (req: RequestValidator<ActivitiesCount>, res: Response) => {
    const account = req.validator.data.account;

    const useFormat = true;
    const bindings = { account };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        balance_events
      WHERE
        affected_account_id = :account
    `;

    const { query, values } = keyBinder(
      rawQuery({ select: 'event_index' }),
      bindings,
      useFormat,
    );

    const { rows } = await db.query(
      `SELECT cost, rows as count FROM count_cost_estimate(${query})`,
      values,
    );

    const cost = +rows?.[0]?.cost;
    const count = +rows?.[0]?.count;

    console.log({ cost, count });

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return res.status(200).json({ activities: rows });
    }

    const { query: countQuery, values: countValues } = keyBinder(
      rawQuery({ select: 'COUNT(event_index)' }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ activities: countRows });
  },
);

export default { changes, changesCount };
