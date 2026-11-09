import type { NextFunction, Request, Response } from 'express';

import catchAsync from '#libs/async';
import logger from '#libs/logger';
import { getProvider } from '#libs/near';
import {
  countryFromHeaders,
  onlineReports,
  storeReport,
  toReport,
} from '#libs/nodeTelemetry';
import schema from '#libs/schema/legacy';

// Linear; a Map also keeps keys like "__proto__" as plain data.
const countBy = <T>(items: T[], key: (item: T) => null | string) => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item) ?? 'unknown';
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Object.fromEntries(counts);
};

// Telemetry only from the NEAR explorer hostnames NEAR nodes are configured with.
const TELEMETRY_HOST = /^explorer(\.(mainnet|testnet))?\.near\.org$/;
// In-memory per-IP limit (not Redis): a few reports per 10s covers several nodes
// behind one IP; extra posts still get 200 but are not stored.
const WINDOW_MS = 10_000;
const PER_WINDOW = 5;
const hits = new Map<string, { count: number; start: number }>();

// IPv6 by /64, since one host can rotate through a whole /64.
const ipKey = (ip: string) =>
  ip.includes(':') ? ip.split(':').slice(0, 4).join(':') : ip;

const allow = (ip: string) => {
  const now = Date.now();
  const hit = hits.get(ip);
  if (!hit || now - hit.start > WINDOW_MS) {
    if (hits.size > 50_000) hits.clear();
    hits.set(ip, { count: 1, start: now });
    return true;
  }
  hit.count += 1;
  return hit.count <= PER_WINDOW;
};

// Telemetry ingest: always 200 straight away; anything invalid is dropped quietly.
export const ingest = (req: Request, res: Response) => {
  res.status(200).end();
  if (!TELEMETRY_HOST.test(req.hostname) || !allow(ipKey(req.ip ?? ''))) return;
  const parsed = schema.nodes.safeParse(req.body);
  if (parsed.success) {
    void storeReport(
      toReport(
        parsed.data,
        countryFromHeaders((name) => req.get(name)),
      ),
    );
  }
};

// Body-parser errors (bad JSON, too large, wrong type) on this route: still a quiet
// 200, never the global 500 handler or its error log.
export const ingestErrors = (
  _err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (!res.headersSent) res.status(200).end();
};

// Current validator accounts, from RPC every 10 min: is_validator in reports is
// self-claimed, so the map trusts only this.
const VALIDATORS_MS = 600_000;
let validators: { at: number; ids: Promise<Set<string>> } | null = null;

const currentValidators = (): Promise<Set<string>> => {
  if (!validators || Date.now() - validators.at > VALIDATORS_MS) {
    const ids = getProvider()
      .validators(null)
      .then((v) => new Set(v.current_validators.map((x) => x.account_id)))
      .catch((error) => {
        logger.warn(
          { error: String(error) },
          'node telemetry: validators unavailable',
        );
        validators = null;
        return new Set<string>();
      });
    validators = { at: Date.now(), ids };
  }
  return validators.ids;
};

// The response body is built once per CACHE_MS per pod and is cacheable downstream.
const CACHE_MS = 30_000;
let body: { at: number; json: Promise<string> } | null = null;

const buildBody = async () => {
  const [reports, validatorIds] = await Promise.all([
    onlineReports(),
    currentValidators(),
  ]);
  const nodes = reports.map((r) => ({
    account_id: r.account_id,
    country: r.country,
    height: r.height,
    is_validator: !!r.account_id && validatorIds.has(r.account_id),
    last_seen: r.last_seen,
    node_id: r.node_id,
    version: r.version,
  }));
  return JSON.stringify({
    data: {
      by_country: countBy(nodes, (n) => n.country),
      by_version: countBy(nodes, (n) => n.version),
      nodes,
      total: nodes.length,
      validators: nodes.filter((n) => n.is_validator).length,
    },
  });
};

// Nodes that reported in the last 10 minutes, plus version and country counts.
// account_id and version are self-reported by the node.
const list = catchAsync(async (_req: Request, res: Response) => {
  if (!body || Date.now() - body.at > CACHE_MS) {
    const json = buildBody();
    body = { at: Date.now(), json };
    json.catch(() => {
      if (body?.json === json) body = null;
    });
  }
  const json = await body.json;
  res.set('Cache-Control', `public, max-age=${CACHE_MS / 1000}`);
  res.type('json').send(json);
});

export default { list };
