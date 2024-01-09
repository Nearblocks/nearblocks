import { Response } from 'express';
import geoip from 'geoip-lite';

import catchAsync from '#libs/async';
import db from '#libs/db';
import { NodeTelemetry } from '#libs/schema/node';
import { keyBinder } from '#libs/utils';
import { RequestValidator } from '#types/types';

const telemetry = catchAsync(
  async (req: RequestValidator<NodeTelemetry>, res: Response) => {
    const nodeInfo = req.validator.data;
    const geo = geoip.lookup(nodeInfo.ipAddress);

    const { query, values } = keyBinder(
      `
    INSERT INTO nodes (
        node_id,
        ip_address,
        moniker, 
        account_id,
        last_seen,
        last_height,
        agent_name,
        agent_version,
        agent_build,
        peer_count,
        is_validator,
        last_hash,
        signature,
        status,
        latitude,
        longitude,
        city,
        bandwidth_download,
        bandwidth_upload,
        cpu_usage,
        memory_usage,
        boot_time_seconds, 
        block_production_tracking_delay,
        min_block_production_delay,
        max_block_production_delay,
        max_block_wait_delay
    )
    VALUES (
        :nodeId,
        :ipAddress,
        :moniker, 
        :accountId,
        :lastSeen,
        :lastHeight,
        :agentName,
        :agentVersion,
        :agentBuild,
        :peerCount,
        :isValidator,
        :lastHash,
        :signature,
        :status,
        :latitude,
        :longitude,
        :city,
        :bandwidthDownload,
        :bandwidthUpload,
        :cpuUsage,
        :memoryUsage,
        :bootTimeSeconds, 
        :blockProductionTrackingDelay,
        :minBlockProductionDelay,
        :maxBlockProductionDelay,
        :maxBlockWaitDelay
    ) ON CONFLICT (node_id) DO UPDATE 
        SET 
        ip_address = :ipAddress,
        moniker = :moniker,
        account_id = :accountId,
        last_seen = :lastSeen,
        last_height = :lastHeight,
        agent_name = :agentName,
        agent_version = :agentVersion,
        agent_build = :agentBuild,
        peer_count = :peerCount,
        is_validator = :isValidator,
        last_hash = :lastHash,
        signature = :signature,
        status = :status,
        latitude = :latitude,
        longitude = :longitude,
        city = :city,
        bandwidth_download = :bandwidthDownload,
        bandwidth_upload = :bandwidthUpload,
        cpu_usage = :cpuUsage,
        memory_usage = :memoryUsage,
        boot_time_seconds = :bootTimeSeconds, 
        block_production_tracking_delay = :blockProductionTrackingDelay,
        min_block_production_delay = :minBlockProductionDelay,
        max_block_production_delay = :maxBlockProductionDelay,
        max_block_wait_delay = :maxBlockWaitDelay
    `,
      {
        accountId: nodeInfo.chain.account_id || '',
        agentBuild: nodeInfo.agent.build,
        agentName: nodeInfo.agent.name,
        agentVersion: nodeInfo.agent.version,
        bandwidthDownload: nodeInfo.system.bandwidth_download,
        bandwidthUpload: nodeInfo.system.bandwidth_upload,
        blockProductionTrackingDelay:
          nodeInfo.chain.block_production_tracking_delay,
        bootTimeSeconds: nodeInfo.system.boot_time_seconds
          ? new Date(nodeInfo.system.boot_time_seconds * 1000)
          : null,
        city: geo ? geo.city : null,
        cpuUsage: nodeInfo.system.cpu_usage,
        ipAddress: nodeInfo.ipAddress,
        isValidator: nodeInfo.chain.is_validator,
        lastHash: nodeInfo.chain.latest_block_hash,
        lastHeight: nodeInfo.chain.latest_block_height.toString(),
        lastSeen: new Date(),
        latitude: geo ? geo.ll[0].toString() : null,
        longitude: geo ? geo.ll[1].toString() : null,
        maxBlockProductionDelay: nodeInfo.chain.max_block_production_delay,
        maxBlockWaitDelay: nodeInfo.chain.max_block_wait_delay,
        memoryUsage: nodeInfo.system.memory_usage.toString(),
        minBlockProductionDelay: nodeInfo.chain.min_block_production_delay,
        moniker: nodeInfo.chain.account_id || '',
        nodeId: nodeInfo.chain.node_id,
        peerCount: nodeInfo.chain.num_peers.toString(),
        signature: nodeInfo.signature || '',
        status: nodeInfo.chain.status,
      },
    );

    await db.query(query, values);

    return res.status(200).json();
  },
);
export default { telemetry };
