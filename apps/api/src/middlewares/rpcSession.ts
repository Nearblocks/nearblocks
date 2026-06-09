import { NextFunction, Request, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import { extractRpcId, jsonRpcError, RPC_ERROR_CODE } from '#libs/rpc';
import { verifySession } from '#libs/rpcSession';

const SESSION_HEADER = 'x-rpc-session';
const SESSION_COOKIE = 'rpc_session';

// Read the session credential from the x-rpc-session header, falling back to a
// cookie of the same purpose (harmless secondary path for a future same-origin
// deployment; req.cookies is undefined unless a cookie parser is mounted).
const readSession = (req: Request): string => {
  const header = req.headers[SESSION_HEADER];

  if (typeof header === 'string' && header) {
    return header;
  }

  const cookies = (req as Request & { cookies?: Record<string, string> })
    .cookies;

  return cookies?.[SESSION_COOKIE] ?? '';
};

// Phase-2 session enforcement. Hard no-op when the flag is off, guaranteeing
// flag-OFF behaviour is identical to Phase 1. When on, a valid session
// credential is required or the request is rejected with a JSON-RPC error.
const rpcSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!config.rpcSessionEnforced) {
      return next();
    }

    const token = readSession(req);

    if (token && verifySession(token)) {
      return next();
    }

    return res
      .status(401)
      .json(
        jsonRpcError(
          extractRpcId(req.body),
          RPC_ERROR_CODE.SESSION_REQUIRED,
          'Session required',
        ),
      );
  },
);

export default rpcSession;
