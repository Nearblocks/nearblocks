import { NextFunction, Request, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import { extractRpcId, jsonRpcError, RPC_ERROR_CODE } from '#libs/rpc';

// Parse the configured comma-separated allowlist into trimmed, non-empty entries.
const parseAllowlist = (raw: string): string[] =>
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

// Resolve the caller's origin from the Origin header, falling back to the
// origin component of the Referer. Returns null when neither is present
// (same-origin XHR / server-to-server callers send no Origin).
const requestOrigin = (req: Request): null | string => {
  const origin = req.headers.origin;

  if (typeof origin === 'string' && origin) {
    return origin;
  }

  const referer = req.headers.referer;

  if (typeof referer === 'string' && referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }

  return null;
};

// Guards the RPC proxy against off-site abuse. When no allowlist is configured
// the proxy is open (Phase-1 / dev default). Otherwise the caller's Origin must
// be present in the allowlist; an absent Origin is treated as a trusted
// same-origin/server caller and allowed.
const rpcOrigin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowlist = parseAllowlist(config.rpcAllowedOrigins);

    if (allowlist.length === 0) {
      return next();
    }

    const origin = requestOrigin(req);

    if (!origin || allowlist.includes(origin)) {
      return next();
    }

    return res
      .status(403)
      .json(
        jsonRpcError(
          extractRpcId(req.body),
          RPC_ERROR_CODE.INVALID_REQUEST,
          'Origin not allowed',
        ),
      );
  },
);

export default rpcOrigin;
