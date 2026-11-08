import config from '#config';
import logger from '#libs/logger';
import { redisClient } from '#libs/redis';
import type { Nodes } from '#libs/schema/legacy';

// NEAR nodes POST telemetry every few seconds. Keep only the latest report per node,
// in Redis, without the sender's IP. Location comes from Cloudflare's visitor-location
// headers (no local GeoIP database), rounded. Entries expire after STALE_MS; the hash
// is capped against spam.
const HASH = `api:${config.network}:telemetry:nodes`;
const SEEN = `${HASH}:seen`;
const MAX_NODES = 20_000;
const MAX_LIST = 5_000;
const CACHE_MS = 30_000;
const FULL_PRUNE_MS = 3_600_000;
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

type Geo = {
  city: null | string;
  country: null | string;
  lat: null | number;
  lon: null | number;
};

// cf-ipcountry is always set; city and coordinates need Cloudflare's "Add visitor
// location headers" managed transform. XX/T1 mean unknown/Tor.
export const geoFromHeaders = (
  get: (name: string) => string | undefined,
): Geo => {
  // Only trust Cloudflare headers on requests that came through Cloudflare.
  if (!get('cf-ray'))
    return { city: null, country: null, lat: null, lon: null };
  const country = get('cf-ipcountry') ?? '';
  const lat = Number.parseFloat(get('cf-iplatitude') ?? '');
  const lon = Number.parseFloat(get('cf-iplongitude') ?? '');
  return {
    city: get('cf-ipcity')?.slice(0, 64) || null,
    country: /^[A-Z]{2}$/.test(country) && country !== 'XX' ? country : null,
    lat: Number.isFinite(lat) && Math.abs(lat) <= 90 ? round1(lat) : null,
    lon: Number.isFinite(lon) && Math.abs(lon) <= 180 ? round1(lon) : null,
  };
};

export const toReport = (data: Nodes, geo: Geo): NodeReport => ({
  account_id: data.chain.account_id ?? null,
  build: data.agent.build,
  ...geo,
  height: data.chain.latest_block_height,
  is_validator: data.chain.is_validator,
  last_seen: Date.now(),
  node_id: data.chain.node_id,
  peers: data.chain.num_peers,
  status: data.chain.status,
  version: data.agent.version,
});

// Atomic capped upsert. When full, first drop entries silent for an hour, so junk
// ids can't lock real nodes out for a day.
const UPSERT = `
local hash, seen = KEYS[1], KEYS[2]
local id, json, now = ARGV[1], ARGV[2], tonumber(ARGV[3])
local cap, prune = tonumber(ARGV[4]), tonumber(ARGV[5])
if redis.call('HEXISTS', hash, id) == 0 and redis.call('ZCARD', seen) >= cap then
  local old = redis.call('ZRANGEBYSCORE', seen, 0, now - prune, 'LIMIT', 0, 500)
  for _, o in ipairs(old) do
    redis.call('HDEL', hash, o)
    redis.call('ZREM', seen, o)
  end
  if redis.call('ZCARD', seen) >= cap then return 0 end
end
redis.call('HSET', hash, id, json)
redis.call('ZADD', seen, now, id)
return 1`;

let lastWarnAt = 0;

export const storeReport = async (report: NodeReport) => {
  try {
    await redisClient.eval(
      UPSERT,
      2,
      HASH,
      SEEN,
      report.node_id,
      JSON.stringify(report),
      report.last_seen,
      MAX_NODES,
      FULL_PRUNE_MS,
    );
  } catch (error) {
    // At most one line a minute: this path is unauthenticated and high-volume.
    if (Date.now() - lastWarnAt > 60_000) {
      lastWarnAt = Date.now();
      logger.warn({ error: String(error) }, 'node telemetry store failed');
    }
  }
};

const readOnline = async (): Promise<NodeReport[]> => {
  const now = Date.now();
  const stale = await redisClient.zrangebyscore(
    SEEN,
    0,
    now - STALE_MS,
    'LIMIT',
    0,
    1000,
  );
  if (stale.length) {
    await redisClient
      .multi()
      .hdel(HASH, ...stale)
      .zrem(SEEN, ...stale)
      .exec();
  }
  const ids = await redisClient.zrevrangebyscore(
    SEEN,
    '+inf',
    now - ONLINE_MS,
    'LIMIT',
    0,
    MAX_LIST,
  );
  if (!ids.length) return [];
  const rows = await redisClient.hmget(HASH, ...ids);
  return rows.flatMap((row) => (row ? [JSON.parse(row) as NodeReport] : []));
};

// Shared per pod for CACHE_MS, so callers can't make every request re-read Redis.
let cached: { at: number; reports: Promise<NodeReport[]> } | null = null;

export const onlineReports = (): Promise<NodeReport[]> => {
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const reports = readOnline();
    cached = { at: Date.now(), reports };
    reports.catch(() => {
      cached = null;
    });
  }
  return cached.reports;
};
