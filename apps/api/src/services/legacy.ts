import { Response } from 'express';
import geoip from 'geoip-lite';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql, { writeSql } from '#libs/postgres';
import { Fees, Nodes, Supply } from '#libs/schema/legacy';
import { msToNsTime, yoctoToNear } from '#libs/utils';
import { RequestValidator } from '#types/types';

const supply = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const unit = req.validator.data.unit;
    const format = req.validator.data.format;

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

    let circulatingSupply = rows?.[0]?.circulating_supply;
    if (unit === 'near') {
      circulatingSupply = (+yoctoToNear(circulatingSupply)).toFixed();

      if (format === 'coingecko') {
        return res.status(200).json({ result: circulatingSupply });
      }

      return res.send(circulatingSupply);
    }

    if (format === 'coingecko') {
      return res.status(200).json({ result: circulatingSupply });
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
    const format = req.validator.data.format;

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

    let totalSupply = rows?.[0]?.total_supply;

    if (unit === 'near') {
      totalSupply = (+yoctoToNear(totalSupply)).toFixed();

      if (format === 'coingecko') {
        return res.status(200).json({ result: totalSupply });
      }

      return res.send(totalSupply);
    }

    if (format === 'coingecko') {
      return res.status(200).json({ result: totalSupply });
    }

    return res.status(200).json({
      timestamp: rows?.[0]?.block_timestamp,
      total_supply_in_yoctonear: rows?.[0]?.total_supply,
    });
  },
);

const fees = catchAsync(async (req: RequestValidator<Fees>, res: Response) => {
  const period = req.validator.data.period;
  const days = Array.from(
    { length: period === 'week' ? 7 : 1 },
    (_, index) => index + 1,
  );

  const resp = await Promise.all(
    days.map(async (day) => {
      const start = dayjs.utc().subtract(day, 'day').startOf('day');
      const end = dayjs
        .utc()
        .subtract(day - 1, 'day')
        .startOf('day');

      const rows = await sql`
        SELECT
          SUM(tokens_burnt)
        FROM
          execution_outcomes
        WHERE
          executed_in_block_timestamp >= ${msToNsTime(start.valueOf())}
          AND executed_in_block_timestamp < ${msToNsTime(end.valueOf())}
      `;

      return {
        collected_fee_in_yoctonear: rows?.[0]?.sum ?? 0,
        date: start.format('YYYY-MM-DD'),
      };
    }),
  );

  if (period === 'day') {
    return res.status(200).json(resp?.[0]);
  }

  return res.status(200).json(resp);
});

const ping = catchAsync(async (_req: Request, res: Response) => {
  return res.send('pong');
});

const nodes = catchAsync(
  async (req: RequestValidator<Nodes>, res: Response) => {
    const data = req.validator.data;
    const geo = geoip.lookup(req.ip!);
    const node = {
      account_id: data.chain.account_id ?? null,
      agent_build: data.agent.build,
      agent_name: data.agent.name,
      agent_version: data.agent.version,
      bandwidth_download: data.system.bandwidth_download,
      bandwidth_upload: data.system.bandwidth_upload,
      block_production_tracking_delay:
        data.chain.block_production_tracking_delay ?? null,
      boot_time_seconds: data.system.boot_time_seconds
        ? new Date(data.system.boot_time_seconds * 1000)
        : null,
      city: geo ? geo.city : null,
      cpu_usage: data.system.cpu_usage,
      ip_address: req.ip!,
      is_validator: data.chain.is_validator,
      last_hash: data.chain.latest_block_hash,
      last_height: data.chain.latest_block_height,
      last_seen: new Date(),
      latitude: geo ? geo.ll[0] : null,
      longitude: geo ? geo.ll[1] : null,
      max_block_production_delay: data.chain.max_block_production_delay ?? null,
      max_block_wait_delay: data.chain.max_block_wait_delay ?? null,
      memory_usage: data.system.memory_usage,
      min_block_production_delay: data.chain.min_block_production_delay ?? null,
      moniker: data.chain.account_id ?? null,
      node_id: data.chain.node_id,
      peer_count: data.chain.num_peers,
      signature: data.signature ?? null,
      status: data.chain.status,
    };

    await writeSql`
      INSERT INTO
        nodes ${writeSql(node)}
      ON CONFLICT (node_id) DO
      UPDATE
      SET
        ${writeSql(node)}
    `;

    return res.status(200).json();
  },
);

export default { fees, nodes, ping, supply, total };
