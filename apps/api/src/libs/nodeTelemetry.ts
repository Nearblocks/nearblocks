import geoip from 'geoip-lite';

import config from '#config';
import logger from '#libs/logger';
import { redisClient } from '#libs/redis';
import type { Nodes } from '#libs/schema/legacy';

// NEAR nodes POST telemetry every few seconds. Keep only the latest report per node,
// in Redis, without the sender's IP (geo is reduced to country/city and a rounded
// location). Entries expire after STALE_MS; the hash is capped against spam.
const HASH = `api:${config.network}:telemetry:nodes`;
const SEEN = `${HASH}:seen`;
const MAX_NODES = 20_000;
const ONLINE_MS = 10 * 60_000;
const STALE_MS = 24 * 3_600_000;

export type NodeReport = {
  account_id: null | string;
  build: string;
  city: null | string;
  country: null | string;
  height: number;
  is_validator: boolean;
  last_seen: number;
  lat: null | number;
  lon: null | number;
  node_id: string;
  peers: number;
  status: string;
  version: string;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export const toReport = (data: Nodes, ip: string | undefined): NodeReport => {
  const geo = ip ? geoip.lookup(ip) : null;
  return {
    account_id: data.chain.account_id ?? null,
    build: data.agent.build,
    city: geo?.city || null,
    country: geo?.country || null,
    height: data.chain.latest_block_height,
    is_validator: data.chain.is_validator,
    last_seen: Date.now(),
    lat: geo ? round1(geo.ll[0]) : null,
    lon: geo ? round1(geo.ll[1]) : null,
    node_id: data.chain.node_id,
    peers: data.chain.num_peers,
    status: data.chain.status,
    version: data.agent.version,
  };
};

export const storeReport = async (report: NodeReport) => {
  try {
    const known = await redisClient.hexists(HASH, report.node_id);
    if (!known && (await redisClient.zcard(SEEN)) >= MAX_NODES) return;
    await redisClient
      .multi()
      .hset(HASH, report.node_id, JSON.stringify(report))
      .zadd(SEEN, report.last_seen, report.node_id)
      .exec();
  } catch (error) {
    logger.warn({ error: String(error) }, 'node telemetry store failed');
  }
};

export const onlineReports = async (): Promise<NodeReport[]> => {
  const now = Date.now();
  const stale = await redisClient.zrangebyscore(SEEN, 0, now - STALE_MS);
  if (stale.length) {
    await redisClient
      .multi()
      .hdel(HASH, ...stale)
      .zrem(SEEN, ...stale)
      .exec();
  }
  const ids = await redisClient.zrangebyscore(SEEN, now - ONLINE_MS, '+inf');
  if (!ids.length) return [];
  const rows = await redisClient.hmget(HASH, ...ids);
  return rows.flatMap((row) => (row ? [JSON.parse(row) as NodeReport] : []));
};
