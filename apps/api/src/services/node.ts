import { Response } from 'express';
import geoip from 'geoip-lite';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { NodeTelemetry } from '#libs/schema/node';
import { RequestValidator } from '#types/types';

const telemetry = catchAsync(
  async (req: RequestValidator<NodeTelemetry>, res: Response) => {
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

    await sql`
      INSERT INTO
        nodes ${sql(node)}
      ON CONFLICT (node_id) DO
      UPDATE
      SET
        ${sql(node)}
    `;

    return res.status(200).json();
  },
);

export default { telemetry };
