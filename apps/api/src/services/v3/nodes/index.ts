import type { Request, Response } from 'express';

import catchAsync from '#libs/async';
import { onlineReports, storeReport, toReport } from '#libs/nodeTelemetry';
import schema from '#libs/schema/legacy';

const countBy = <T>(items: T[], key: (item: T) => null | string) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item) ?? 'unknown';
    return { ...acc, [k]: (acc[k] ?? 0) + 1 };
  }, {});

// Telemetry ingest: always 200 straight away; invalid reports are dropped quietly.
export const ingest = (req: Request, res: Response) => {
  res.status(200).end();
  const parsed = schema.nodes.safeParse(req.body);
  if (parsed.success) void storeReport(toReport(parsed.data, req.ip));
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
