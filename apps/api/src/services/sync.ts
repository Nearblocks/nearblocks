import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import {
  getBalanceStatus,
  getBaseStatus,
  getEventStatus,
  getFTHoldersStatus,
  getNFTHoldersStatus,
  getStatStatus,
} from '#services/v3/sync/index';

// v1 status is served from the v3 logic; the v1 response shape is preserved for
// existing consumers.

const balance = catchAsync(async (_req: Request, res: Response) => {
  const status = await getBalanceStatus();

  return res.status(200).json({ status });
});

const base = catchAsync(async (_req: Request, res: Response) => {
  const status = await getBaseStatus();

  return res.status(200).json({ status });
});

const events = catchAsync(async (_req: Request, res: Response) => {
  const status = await getEventStatus();

  return res.status(200).json({ status });
});

const ft = catchAsync(async (_req: Request, res: Response) => {
  const status = await getFTHoldersStatus();

  return res.status(200).json({ status });
});

const nft = catchAsync(async (_req: Request, res: Response) => {
  const status = await getNFTHoldersStatus();

  return res.status(200).json({ status });
});

const stats = catchAsync(async (_req: Request, res: Response) => {
  const status = await getStatStatus();

  return res.status(200).json({ status });
});

const status = catchAsync(async (_req: Request, res: Response) => {
  const [base, balance, events, ft, nft, stats] = await Promise.all([
    getBaseStatus(),
    getBalanceStatus(),
    getEventStatus(),
    getFTHoldersStatus(),
    getNFTHoldersStatus(),
    getStatStatus(),
  ]);

  const status = {
    aggregates: {
      ft_holders: ft,
      nft_holders: nft,
    },
    indexers: {
      balance,
      base,
      events,
    },
    jobs: {
      daily_stats: stats,
    },
  };

  return res.status(200).json({ status });
});

export default { balance, base, events, ft, nft, stats, status };
