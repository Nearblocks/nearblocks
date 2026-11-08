import config from '#config';
import logger from '#libs/logger';
import { redisClient } from '#libs/redis';
import type { Nodes } from '#libs/schema/legacy';

// NEAR nodes POST telemetry every few seconds. Keep only the latest report per node,
// in Redis, without the sender's IP; location is only the country Cloudflare reports.
// Entries expire after STALE_MS; the hash is capped against spam.
const HASH = `api:${config.network}:telemetry:nodes`;
const SEEN = `${HASH}:seen`;
const MAX_NODES = 20_000;
const MAX_LIST = 5_000;
const FULL_PRUNE_MS = 3_600_000;
const ONLINE_MS = 10 * 60_000;
const STALE_MS = 24 * 3_600_000;

export type NodeReport = {
  account_id: null | string;
  build: string;
  country: null | string;
  height: number;
  is_validator: boolean;
  last_seen: number;
  node_id: string;
  peers: number;
  status: string;
  version: string;
};

// Country from cf-ipcountry, trusted only on requests that came through Cloudflare
// (cf-ray). XX/T1 mean unknown/Tor.
export const countryFromHeaders = (
  get: (name: string) => string | undefined,
): null | string => {
  if (!get('cf-ray')) return null;
  const country = get('cf-ipcountry') ?? '';
  return /^[A-Z]{2}$/.test(country) && !['T1', 'XX'].includes(country)
    ? country
    : null;
};

export const toReport = (data: Nodes, country: null | string): NodeReport => ({
  account_id: data.chain.account_id ?? null,
  build: data.agent.build,
  country,
  height: data.chain.latest_block_height,
  is_validator: data.chain.is_validator,
  last_seen: Date.now(),
  node_id: data.chain.node_id,
  peers: data.chain.num_peers,
  status: data.chain.status,
  version: data.agent.version,
});

// Atomic capped upsert. When full, drop entries silent for an hour, then the oldest,
// so junk ids can't lock real (frequently reporting) nodes out.
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
  if redis.call('ZCARD', seen) >= cap then
    local oldest = redis.call('ZRANGE', seen, 0, 0)
    if #oldest > 0 then
      redis.call('HDEL', hash, oldest[1])
      redis.call('ZREM', seen, oldest[1])
    end
  end
end
redis.call('HSET', hash, id, json)
redis.call('ZADD', seen, now, id)
return 1`;

// EVALSHA after the first call instead of resending the script each time.
redisClient.defineCommand('telemetryUpsert', { lua: UPSERT, numberOfKeys: 2 });
const upsert = (...args: (number | string)[]) =>
  (
    redisClient as unknown as {
      telemetryUpsert: (...a: (number | string)[]) => Promise<number>;
    }
  ).telemetryUpsert(...args);

let lastWarnAt = 0;

export const storeReport = async (report: NodeReport) => {
  try {
    await upsert(
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

export const onlineReports = async (): Promise<NodeReport[]> => {
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
