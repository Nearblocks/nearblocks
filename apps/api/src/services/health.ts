import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import {
  getBaseStatus as v3BaseStatus,
  getReceiptsStatus as v3ReceiptsStatus,
  getRpcNodeStatus as v3RpcNodeStatus,
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

// Not configured (no block-proxy primary) is reported healthy.
const rpcNode = catchAsync(async (_req: Request, res: Response) => {
  const status = await v3RpcNodeStatus();
  if (!status) return res.status(200).json({ configured: false, sync: true });
  return res.status(status.sync ? 200 : 503).json(status);
});

export default { base, receipts, rpcNode };
