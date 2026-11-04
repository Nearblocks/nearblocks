import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import {
  getBaseStatus as v3BaseStatus,
  getReceiptsStatus as v3ReceiptsStatus,
  getRpcNodesStatus as v3RpcNodesStatus,
} from '#services/v3/sync/index';

// Health probes are served from the v3 logic, preserving the 200/503 contract.

const base = catchAsync(async (_req: Request, res: Response) => {
  const status = await v3BaseStatus();

  return res.status(status.sync ? 200 : 503).json(status);
});

const receipts = catchAsync(async (_req: Request, res: Response) => {
  const status = await v3ReceiptsStatus();

  return res.status(status.sync ? 200 : 503).json(status);
});

// 503 if any block-proxy RPC node is unhealthy; none configured is healthy.
const rpcNodes = catchAsync(async (_req: Request, res: Response) => {
  const nodes = await v3RpcNodesStatus();
  if (!nodes) return res.status(200).json({ configured: false, sync: true });
  const sync = Object.values(nodes).every((node) => node.sync);
  return res.status(sync ? 200 : 503).json({ nodes, sync });
});

export default { base, receipts, rpcNodes };
