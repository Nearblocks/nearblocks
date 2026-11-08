import type { NextFunction, Request, Response } from 'express';

import catchAsync from '#libs/async';
import {
  geoFromHeaders,
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
  if (!TELEMETRY_HOST.test(req.hostname) || !allow(req.ip ?? '')) return;
  const parsed = schema.nodes.safeParse(req.body);
  if (parsed.success) {
    void storeReport(
      toReport(
        parsed.data,
        geoFromHeaders((name) => req.get(name)),
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

// Nodes that reported in the last 10 minutes, plus version and country counts.
const list = catchAsync(async (_req: Request, res: Response) => {
  const nodes = await onlineReports();
  res.json({
    data: {
      by_country: countBy(nodes, (n) => n.country),
      by_version: countBy(nodes, (n) => n.version),
      nodes,
      total: nodes.length,
      validators: nodes.filter((n) => n.is_validator).length,
    },
  });
});

export default { list };
